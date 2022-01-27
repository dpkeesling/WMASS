# Powershell script

function main {
    get-objectname

}

function get-objectname () {
    $loopvalue = $true
    while ($loopvalue) {
        $objectname = Read-Host "Enter the name of the new map object. Must be less than 256 characters"
        $inputcheck = test-userinput($objectname)
        if ($inputcheck) {
            $loopvalue = $false
        }
    }
}

function test-userinput($userinput) {
    $inputlength = $userinput | measure-object -character | Select-Object -expandproperty characters
    if ($inputlength -lt 256) {
        $answer = Read-Host "You have entered: ${userinput}. Is this correct? (Y/N)"
        if (($answer -eq 'Y') -or ($answer -eq 'y')) {
            return $true
        }
        else {
            return $false
        }
    }
    else {
        write-output "The string is ${inputlength} characters, which is too long"
    }
}

function write-tojson () {
    $jsonfile = '../objects.json'

    $json = Get-Content $jsonfile | Out-String | ConvertFrom-Json

    $json | Add-Member -Type NoteProperty -Name 'newKey1' -Value 'newValue1'
    $json | Add-Member -Type NoteProperty -Name 'newKey2' -Value 'newValue2'

    $json | ConvertTo-Json | Set-Content $jsonfile
}

main