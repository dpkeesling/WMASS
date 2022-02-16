# Powershell script

function main {
    $object = New-Object -TypeName psobject
    $temp = get-userinput('name of the new map object')
    $object | Add-Member -MemberType NoteProperty -Name text -Value "${temp}"
    $temp = get-userinput('file path to the icon image file')
    $object | Add-Member -MemberType NoteProperty -Name imgpath -Value "${temp}"
    $object | Add-Member -MemberType NoteProperty -Name iconsize -Value ''
    while($true) {
        $object.iconsize = get-userinput("the icon's length and width in pixels, formatted in ##,## format")
        if($iconsize -match '^\d+,\d+$') {
            break
        }
        Write-Output "Invalid format."
    }

    $object | Add-Member -MemberType NoteProperty -Name iconanchor -Value ''
    while($true) {
        $object.iconanchor = get-userinput("the coordinates of the icon's anchor point, formatted in ##,## format")
        if($object.iconanchor -match '^-?\d+,-?\d+$') {
            break
        }
        Write-Output "Invalid format."
    }

    $object | Add-Member -MemberType NoteProperty -Name popupanchor -Value ''
    while($true) {
        $object.popupanchor = get-userinput("the coordinates of the popup's anchor point, formatted in ##,## format")
        if($object.popupanchor -match '^-?\d+,-?\d+$') {
            break
        }
        Write-Output "Invalid format."
    }

    Write-Output "${get-additionalproperties}"


}

function get-userinput ($promptstring) {
    while ($true) {
        $objectname = Read-Host "Enter the ${promptstring}. Must be less than 256 characters"
        $inputcheck = test-userinput($objectname)
        if ($inputcheck) {
            return $objectname
        }
    }
}

function test-userinput($userinput) {
    $inputlength = $userinput | measure-object -character | Select-Object -expandproperty characters
    if ($inputlength -lt 256) {
        $answer = Read-Host "You have entered: ${userinput}. Is this correct? (Y/N)"
        return ($answer -eq 'Y') -or ($answer -eq 'y')
    }
    else {
        write-output "The string is ${inputlength} characters, which is too long"
    }
}

function get-additionalproperties {
    $additionproperties = @()
    while($true) {
        $object = New-Object -TypeName psobject
        $object | Add-Member -MemberType NoteProperty -Name propertyname -Value Read-Host "Enter the name of an additional property you would like to add. If you have no more properties, type 'exit'"
        if ($object.propertyname -eq 'exit') {
            break
        }
        if (test-userinput($object.propertyname)) {
            $object | Add-Member -MemberType NoteProperty -Name propertyvalue -Value Read-Host "Enter the initial value for this property"
            if (test-userinput($object.propertyname)) {
                $additionproperties += $object
            }
        }
        return $additionproperties
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