import listItems from '../templates/covid.hbs';

const divCovid = document.querySelector('.list');

const baseUrl = 'https://api.thevirustracker.com/free-api';
export default function fetchCovid(query) {
  return fetch(`${baseUrl}?countryTotal=${query}`)
    .then(response => response.json())
    .then(data => {
      renderCovidInfo(data.countrydata);
    });
}

function renderCovidInfo(info) {
  clearCovidInfo();
  const renderList = info.map(info => listItems(info)).join('');
  divCovid.insertAdjacentHTML('beforeend', renderList);
}

function clearCovidInfo() {
  divCovid.innerHTML = '';
}
