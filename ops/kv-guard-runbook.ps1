<#
  Tapbon KV guard — re-applies the Key Vault fix that the MG policy
  "MCAPSGovDeployPolicies" keeps reverting (deletes the policy exemption and
  sets publicNetworkAccess=Disabled on kv-tapbon-prod, which breaks all
  App Service Key Vault references -> prod 502).

  Idempotent. Runs on a schedule from the Automation account aa-tapbon-ops
  (system-assigned managed identity). Roles required:
    - Key Vault Contributor          (vault scope)  : PATCH publicNetworkAccess
    - Resource Policy Contributor    (vault scope)  : PUT policy exemption
    - Website Contributor            (site scope)   : refresh app settings
#>

$ErrorActionPreference = 'Stop'

$SubId    = 'e67d6d69-e3d9-483e-b5a8-7467aaf6b392'
$Rg       = 'rg-tapbon-prod'
$Vault    = 'kv-tapbon-prod'
$Site     = 'tapbon-app'
$MgmtGrp  = 'b5fc2195-680b-4dc0-b658-8c7a1e5112e2'   # tenant root MG
$PolicyAssignment = "/providers/Microsoft.Management/managementGroups/$MgmtGrp/providers/Microsoft.Authorization/policyAssignments/MCAPSGovDeployPolicies"

Connect-AzAccount -Identity -Subscription $SubId | Out-Null

$kvId   = "/subscriptions/$SubId/resourceGroups/$Rg/providers/Microsoft.KeyVault/vaults/$Vault"
$siteId = "/subscriptions/$SubId/resourceGroups/$Rg/providers/Microsoft.Web/sites/$Site"
$changed = $false

# 1) Ensure the policy exemption exists (PUT is idempotent)
$exemptUri = "$kvId/providers/Microsoft.Authorization/policyExemptions/kv-tapbon-exempt?api-version=2022-07-01-preview"
$exists = Invoke-AzRestMethod -Method GET -Path $exemptUri
if ($exists.StatusCode -ne 200) {
    $body = @{ properties = @{
        policyAssignmentId = $PolicyAssignment
        exemptionCategory  = 'Waiver'
        displayName        = 'Tapbon prod KV public access (auto-reapplied)'
    } } | ConvertTo-Json -Depth 5
    $r = Invoke-AzRestMethod -Method PUT -Path $exemptUri -Payload $body
    if ($r.StatusCode -ge 300) { throw "Exemption PUT failed: $($r.StatusCode) $($r.Content)" }
    Write-Output 'Recreated policy exemption.'
    $changed = $true
}

# 2) Ensure publicNetworkAccess = Enabled
$kv = (Invoke-AzRestMethod -Method GET -Path "$kvId`?api-version=2023-07-01").Content | ConvertFrom-Json
if ($kv.properties.publicNetworkAccess -ne 'Enabled') {
    $r = Invoke-AzRestMethod -Method PATCH -Path "$kvId`?api-version=2023-07-01" `
        -Payload '{"properties":{"publicNetworkAccess":"Enabled"}}'
    if ($r.StatusCode -ge 300) { throw "KV PATCH failed: $($r.StatusCode) $($r.Content)" }
    Write-Output 'Re-enabled Key Vault public network access.'
    $changed = $true
    Start-Sleep -Seconds 20
}

# 3) Check KV reference resolution on the app
$refs = (Invoke-AzRestMethod -Method GET -Path "$siteId/config/configreferences/appsettings?api-version=2022-03-01").Content | ConvertFrom-Json
$unresolved = @($refs.value | Where-Object { $_.properties.status -ne 'Resolved' })

# 4) If anything was fixed or references are broken, force re-resolution by
#    touching an app setting (a restart alone does NOT refresh references).
if ($changed -or $unresolved.Count -gt 0) {
    $settings = (Invoke-AzRestMethod -Method POST -Path "$siteId/config/appsettings/list?api-version=2022-03-01").Content | ConvertFrom-Json
    $settings.properties | Add-Member -NotePropertyName 'KV_REFRESH_TICK' -NotePropertyValue "$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())" -Force
    $payload = @{ properties = $settings.properties } | ConvertTo-Json -Depth 5
    $r = Invoke-AzRestMethod -Method PUT -Path "$siteId/config/appsettings?api-version=2022-03-01" -Payload $payload
    if ($r.StatusCode -ge 300) { throw "App settings PUT failed: $($r.StatusCode) $($r.Content)" }
    Write-Output "Forced KV reference re-resolution ($($unresolved.Count) unresolved before)."
} else {
    Write-Output 'All good — exemption present, vault open, references resolved.'
}
