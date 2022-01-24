# Powershell script

function main {
    $objectname = Read-Host "Enter the name of the new map object. Must be less than 256 characters"

    $objectnamelength = $objectname | measure-object -character | select -expandproperty characters
    # write-output "The string is ${objectnamelength} long"
    if ($objectnamelength -lt 256) {

    }
    else {
        write-output "The string is ${objectnamelength} characters, which is too long"
    }

}

function write-to-json () {
    $jsonfile = '../objects.json'

    $json = Get-Content $jsonfile | Out-String | ConvertFrom-Json

    $json | Add-Member -Type NoteProperty -Name 'newKey1' -Value 'newValue1'
    $json | Add-Member -Type NoteProperty -Name 'newKey2' -Value 'newValue2'

    $json | ConvertTo-Json | Set-Content $jsonfile
}

main