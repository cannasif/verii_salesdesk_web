$ErrorActionPreference = 'Continue'
$base = 'http://localhost:5001'
$results = New-Object System.Collections.Generic.List[object]

function Add-Result($name, $status, $detail) {
  $results.Add([pscustomobject]@{ Test = $name; Status = $status; Detail = $detail }) | Out-Null
}

$token = $null
$headers = $null
try {
  $loginBody = '{"email":"admin@v3rii.com","password":"Veriipass123!","rememberMe":true}'
  $login = Invoke-RestMethod -Uri "$base/api/auth/login" -Method Post -Body $loginBody -ContentType 'application/json'
  if ($login.success -and $login.data.token) {
    $token = $login.data.token
    $headers = @{ Authorization = "Bearer $token"; 'Content-Type' = 'application/json' }
    Add-Result 'Login' 'PASS' 'Token alindi'
  } else {
    Add-Result 'Login' 'FAIL' $login.message
  }
} catch {
  Add-Result 'Login' 'FAIL' $_.Exception.Message
}

$potentialId = $null
$potentialCode = $null

if ($headers) {
  try {
    $list = Invoke-RestMethod -Uri "$base/api/salesdesk/potentials?pageNumber=1&pageSize=10" -Headers $headers
    if ($list.success) {
      Add-Result 'Potansiyel listeleme (GET)' 'PASS' "Toplam: $($list.data.totalCount)"
    } else {
      Add-Result 'Potansiyel listeleme (GET)' 'FAIL' $list.message
    }
  } catch {
    Add-Result 'Potansiyel listeleme (GET)' 'FAIL' $_.Exception.Message
  }

  try {
    $createBody = '{"companyName":"Test Potansiyel A.S.","contactName":"Test Yetkili","phone":"05551112233","email":"potansiyel@test.com","city":"Izmir","district":"Konak","status":1,"matchScore":75}'
    $created = Invoke-RestMethod -Uri "$base/api/salesdesk/potentials" -Method Post -Headers $headers -Body $createBody
    if ($created.success -and $created.data.id) {
      $potentialId = $created.data.id
      $potentialCode = $created.data.code
      Add-Result 'Potansiyel olusturma (POST)' 'PASS' "Id=$potentialId Code=$potentialCode"
    } else {
      Add-Result 'Potansiyel olusturma (POST)' 'FAIL' $created.message
    }
  } catch {
    Add-Result 'Potansiyel olusturma (POST)' 'FAIL' $_.Exception.Message
  }

  if ($potentialId) {
    try {
      $updateBody = "{`"companyName`":`"Test Potansiyel Guncellendi`",`"contactName`":`"Guncel Yetkili`",`"phone`":`"05559998877`",`"email`":`"potansiyel@test.com`",`"city`":`"Ankara`",`"district`":`"Cankaya`",`"status`":4,`"matchScore`":90,`"code`":`"$potentialCode`"}"
      $updated = Invoke-RestMethod -Uri "$base/api/salesdesk/potentials/$potentialId" -Method Put -Headers $headers -Body $updateBody
      if ($updated.success -and $updated.data.status -eq 4) {
        Add-Result 'Potansiyel guncelleme (PUT)' 'PASS' $updated.data.companyName
      } else {
        Add-Result 'Potansiyel guncelleme (PUT)' 'FAIL' $updated.message
      }
    } catch {
      Add-Result 'Potansiyel guncelleme (PUT)' 'FAIL' $_.Exception.Message
    }

    try {
      $deleted = Invoke-RestMethod -Uri "$base/api/salesdesk/potentials/$potentialId" -Method Delete -Headers $headers
      if ($deleted.success) {
        Add-Result 'Potansiyel silme (DELETE)' 'PASS' 'Soft delete OK'
      } else {
        Add-Result 'Potansiyel silme (DELETE)' 'FAIL' $deleted.message
      }
    } catch {
      Add-Result 'Potansiyel silme (DELETE)' 'FAIL' $_.Exception.Message
    }
  }
}

$results | Format-Table -AutoSize
$pass = ($results | Where-Object { $_.Status -eq 'PASS' }).Count
$fail = ($results | Where-Object { $_.Status -eq 'FAIL' }).Count
Write-Output ""
Write-Output "SONUC: PASS=$pass FAIL=$fail TOPLAM=$($results.Count)"
if ($fail -gt 0) { exit 1 }
