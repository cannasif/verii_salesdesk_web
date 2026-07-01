$ErrorActionPreference = 'Continue'
$base = 'http://localhost:5001'
$results = New-Object System.Collections.Generic.List[object]

function Add-Result($name, $status, $detail) {
  $results.Add([pscustomobject]@{ Test = $name; Status = $status; Detail = $detail }) | Out-Null
}

try {
  $r = Invoke-WebRequest -Uri "$base/api/salesdesk/customers?pageNumber=1&pageSize=1" -UseBasicParsing -TimeoutSec 10
  if ($r.StatusCode -eq 401) {
    Add-Result 'API erisilebilirligi' 'PASS' '401 Unauthorized (beklenen)'
  } else {
    Add-Result 'API erisilebilirligi' 'FAIL' "Beklenen 401, gelen $($r.StatusCode)"
  }
} catch {
  $code = $null
  if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
  if ($code -eq 401) {
    Add-Result 'API erisilebilirligi' 'PASS' '401 Unauthorized (beklenen)'
  } else {
    Add-Result 'API erisilebilirligi' 'FAIL' $_.Exception.Message
  }
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
    $msg = $login.message
    if (-not $msg) { $msg = 'Login basarisiz' }
    Add-Result 'Login' 'FAIL' $msg
  }
} catch {
  Add-Result 'Login' 'FAIL' $_.Exception.Message
}

$customerId = $null
$customerCode = $null

if ($headers) {
  try {
    $list = Invoke-RestMethod -Uri "$base/api/salesdesk/customers?pageNumber=1&pageSize=10" -Headers $headers
    if ($list.success) {
      Add-Result 'Cari listeleme (GET)' 'PASS' "Toplam: $($list.data.totalCount)"
    } else {
      Add-Result 'Cari listeleme (GET)' 'FAIL' $list.message
    }
  } catch {
    Add-Result 'Cari listeleme (GET)' 'FAIL' $_.Exception.Message
  }

  try {
    $createBody = '{"name":"Test Cari Otomasyon","contactName":"Test Yetkili","phone":"05551234567","email":"test.cari@example.com","kind":1,"balance":1500.50,"city":"Istanbul","district":"Kadikoy"}'
    $created = Invoke-RestMethod -Uri "$base/api/salesdesk/customers" -Method Post -Headers $headers -Body $createBody
    if ($created.success -and $created.data.id) {
      $customerId = $created.data.id
      $customerCode = $created.data.code
      Add-Result 'Cari olusturma (POST)' 'PASS' "Id=$customerId Code=$customerCode"
    } else {
      Add-Result 'Cari olusturma (POST)' 'FAIL' $created.message
    }
  } catch {
    Add-Result 'Cari olusturma (POST)' 'FAIL' $_.Exception.Message
  }

  if ($customerId) {
    try {
      $one = Invoke-RestMethod -Uri "$base/api/salesdesk/customers/$customerId" -Headers $headers
      if ($one.success -and $one.data.name -eq 'Test Cari Otomasyon') {
        Add-Result 'Cari detay (GET by id)' 'PASS' $one.data.name
      } else {
        Add-Result 'Cari detay (GET by id)' 'FAIL' $one.message
      }
    } catch {
      Add-Result 'Cari detay (GET by id)' 'FAIL' $_.Exception.Message
    }

    try {
      $updateBody = "{`"name`":`"Test Cari Guncellendi`",`"contactName`":`"Guncel Yetkili`",`"phone`":`"05559876543`",`"email`":`"test.cari@example.com`",`"kind`":2,`"balance`":2500,`"city`":`"Ankara`",`"district`":`"Cankaya`",`"code`":`"$customerCode`"}"
      $updated = Invoke-RestMethod -Uri "$base/api/salesdesk/customers/$customerId" -Method Put -Headers $headers -Body $updateBody
      if ($updated.success -and $updated.data.name -eq 'Test Cari Guncellendi') {
        Add-Result 'Cari guncelleme (PUT)' 'PASS' $updated.data.name
      } else {
        Add-Result 'Cari guncelleme (PUT)' 'FAIL' $updated.message
      }
    } catch {
      Add-Result 'Cari guncelleme (PUT)' 'FAIL' $_.Exception.Message
    }

    try {
      $deleted = Invoke-RestMethod -Uri "$base/api/salesdesk/customers/$customerId" -Method Delete -Headers $headers
      if ($deleted.success) {
        Add-Result 'Cari silme (DELETE)' 'PASS' 'Soft delete OK'
      } else {
        Add-Result 'Cari silme (DELETE)' 'FAIL' $deleted.message
      }
    } catch {
      Add-Result 'Cari silme (DELETE)' 'FAIL' $_.Exception.Message
    }

    try {
      Invoke-RestMethod -Uri "$base/api/salesdesk/customers/$customerId" -Headers $headers -ErrorAction Stop | Out-Null
      Add-Result 'Silinen cari 404 kontrolu' 'FAIL' 'Silinen kayit hala donuyor'
    } catch {
      $code = $null
      if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
      if ($code -eq 404) {
        Add-Result 'Silinen cari 404 kontrolu' 'PASS' '404 beklenen'
      } else {
        Add-Result 'Silinen cari 404 kontrolu' 'FAIL' $_.Exception.Message
      }
    }
  }
}

$results | Format-Table -AutoSize
$pass = ($results | Where-Object { $_.Status -eq 'PASS' }).Count
$fail = ($results | Where-Object { $_.Status -eq 'FAIL' }).Count
Write-Output ""
Write-Output "SONUC: PASS=$pass FAIL=$fail TOPLAM=$($results.Count)"
if ($fail -gt 0) { exit 1 }
