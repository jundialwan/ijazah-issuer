const socket = io('http://localhost:7777')
console.log('Socket: ', socket)

socket.emit('frontend connect')

// Dekan
socket.on('ACS ACR1281 1S Dual Reader 00 00 inserted', (data) => {
  console.log('Dekan data: ', data)

  document.getElementById('dekan-title').style.display = 'none'

  document.getElementById('dekan-id').innerHTML = data.identityNumber
  document.getElementById('dekan-name').innerHTML = data.fullName
  document.getElementById('dekan-institution').innerHTML = data.institutionName
  document.getElementById('dekan-faculty').innerHTML = data.organizationUnitName
  document.getElementById('dekan-prodi').innerHTML = data.subOrganizationUnitName
})

socket.on('ACS ACR1281 1S Dual Reader 00 00 removed', _ => {
  document.getElementById('dekan-title').style.display = 'block'

  document.getElementById('dekan-id').innerHTML = ''
  document.getElementById('dekan-name').innerHTML = ''
  document.getElementById('dekan-institution').innerHTML = ''
  document.getElementById('dekan-faculty').innerHTML = ''
  document.getElementById('dekan-prodi').innerHTML = ''
})

// Mahasiswa
socket.on('ACS ACR1281 1S Dual Reader 01 00 inserted', (data) => {
  console.log('Mahasiswa data: ', data)

  document.getElementById('mahasiswa-title').style.display = 'none'

  document.getElementById('mahasiswa-id').innerHTML = data.identityNumber
  document.getElementById('mahasiswa-name').innerHTML = data.fullName
  document.getElementById('mahasiswa-institution').innerHTML = data.institutionName
  document.getElementById('mahasiswa-faculty').innerHTML = data.organizationUnitName
  document.getElementById('mahasiswa-prodi').innerHTML = data.subOrganizationUnitName
})

socket.on('ACS ACR1281 1S Dual Reader 01 00 removed', _ => {
  document.getElementById('mahasiswa-title').style.display = 'block'

  document.getElementById('mahasiswa-id').innerHTML = ''
  document.getElementById('mahasiswa-name').innerHTML = ''
  document.getElementById('mahasiswa-institution').innerHTML = ''
  document.getElementById('mahasiswa-faculty').innerHTML = ''
  document.getElementById('mahasiswa-prodi').innerHTML = ''
})

// Rektor
socket.on('ACS ACR1281 1S Dual Reader 02 00 inserted', (data) => {
  console.log('Rektor data: ', data)

  document.getElementById('rektor-title').style.display = 'none'

  document.getElementById('rektor-id').innerHTML = data.identityNumber
  document.getElementById('rektor-name').innerHTML = data.fullName
  document.getElementById('rektor-institution').innerHTML = data.institutionName
  document.getElementById('rektor-faculty').innerHTML = data.organizationUnitName
  document.getElementById('rektor-prodi').innerHTML = data.subOrganizationUnitName
})

socket.on('ACS ACR1281 1S Dual Reader 02 00 removed', _ => {
  document.getElementById('rektor-title').style.display = 'block'

  document.getElementById('rektor-id').innerHTML = ''
  document.getElementById('rektor-name').innerHTML = ''
  document.getElementById('rektor-institution').innerHTML = ''
  document.getElementById('rektor-faculty').innerHTML = ''
  document.getElementById('rektor-prodi').innerHTML = ''
})