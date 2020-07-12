import '@pnotify/core/dist/BrightTheme.css';
import '@pnotify/core/dist/Material.css';
import '@pnotify/core/dist/PNotify.css';

import { defaults } from '@pnotify/core';
import query from '../api/weather';
import memoryBuilder from '../templates/memory.hbs';
import Siema from 'siema';
import fetchCovid from '../api/corona';
import fetchPixabay from '../api/pixabay';
import { alert, notice, info, success, error } from '@pnotify/core';

const debounce = require('lodash.debounce');

const refs = {
  body: document.querySelector('body'),
  input: document.querySelector('.main-input'),
  citiesMemory: document.querySelector('.added-city'),
  deleteCityBtn: document.querySelector('.cross-btn'),
  saveCityBtn: document.querySelector('.save-btn'),
  citiesContainer: document.querySelector('.siema'),
  weatherContainerLocation: document.querySelector('.city'),
  weatherCity: document.getElementById('weather_city'),
  currentTemp: document.getElementById('weather_temp'),
  minTemp: document.getElementById('weather-min_temp'),
  maxTemp: document.getElementById('weather-max_temp'),
  weatherIcon: document.getElementById('weather_icon'),
  //   bottom block
  currentDate: document.getElementById('date'),
  currentDay: document.getElementById('day'),
  currentMonth: document.getElementById('month'),
  currentTimeHr: document.getElementById('current-time-hr'),
  currentTimeMin: document.getElementById('current-time-min'),
  sunrise: document.getElementById('sunrise'),
  sunset: document.getElementById('sunset'),
};

//  ===================  CURRENT CITY START CODE =====================
const reverseGeocoder = new BDCReverseGeocode();

window.addEventListener('load', loadDefaultRender); ////////////////////////////////////////////// LOADING DOM

// ЗАПРОС НА PIXABAY
// function fetchPixabayBgImg() {
//   fetchPixabay.fetchBgImage().then(parsedResponse => {
//     parsedResponse.hits[2].largeImageURL;
//     refs.body.style.backgroundImage = `url(${parsedResponse.hits[2].largeImageURL})`;
//   });
// }

function fetchPixabayBgImg() {
  fetchPixabay.fetchBgImage().then(parsedResponse => {
    parsedResponse.hits[getRandomInt()].largeImageURL;
    refs.body.style.backgroundImage = `url(${
      parsedResponse.hits[getRandomInt()].largeImageURL
    })`;
  });
}

//  ===========  CURRENT CITY BY BROWSER'S COORDS
function loadDefaultRender() {
  reverseGeocoder.getClientLocation(function (result) {
    fetchPixabay.searchQuery = result.localityInfo.administrative[1].name;
    console.log('CURRENT LOCATION', result.localityInfo.administrative[1].name);

    fetchPixabayBgImg();

    //========== WEATHER AT CURRENT CITY =================
    query
      .fetchWeather(result.localityInfo.administrative[1].name)
      .then(data => {
        let keys = Object.values(data.sys.country).join('');
        fetchCovid(keys);

        citiesMemoryMarkUp = {
          name: data.name,
          html: memoryBuilder(data),
        };
        updatePageHtml(data);
      })
      .catch(err => {
        const myError = error({
          delay: 2000,
          maxTextHeight: null,
          text: "CAN'T FIND YOUR REQUEST. PLEASE TRY AGAIN.",
        });
      });
  });
}
//===================  CURRENT CITY END OF CODE========================

const storedCities = JSON.parse(localStorage.getItem('Cities'));
const findedCities = [];

//================ ОТРИСОВКА КАРУСЕЛИ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ИЗ ЛОКАЛСТОРА
if (storedCities === null) {
  const allLi = findedCities
    .map(
      city => `
    <div id=${city} class="btn-wrapper">
      <span class="added-city">${city}</span>
      <button class="cross-btn" data-id=${city}></button>
    </div>`,
    )
    .join('');

  refs.citiesContainer.innerHTML = allLi;
} else {
  const allLi = storedCities
    .map(
      city => `
    <div id=${city} class="btn-wrapper">
      <span class="added-city">${city}</span>
      <button class="cross-btn" data-id=${city}></button>
    </div>`,
    )
    .join('');

  refs.citiesContainer.innerHTML = allLi;
}

let citiesMemoryMarkUp = null;

refs.input.addEventListener('input', debounce(searchFromInput, 1000));
refs.saveCityBtn.addEventListener('click', insertCityToTheMemory);
document.addEventListener('click', removeCityFromMemory);
document.addEventListener('click', renderCityWeather);

function renderCityWeather(e) {
  if (e.target.className !== 'added-city') {
    return;
  }
  const clickedCityName = e.target.textContent;
  fetchPixabay.searchQuery = clickedCityName;
  refs.input.value = '';

  fetchPixabayBgImg();

  query.fetchWeather(clickedCityName).then(data => {
    let keys = Object.values(data.sys.country).join('');
    fetchCovid(keys);
    fetchPixabayBgImg();
    updatePageHtml(data);

    fetchPixabay.searchQuery = data.name;

    citiesMemoryMarkUp = {
      name: data.name,
      html: memoryBuilder(data),
    };
  });
}

function getRandomInt(min, max) {
  min = 1;
  max = 20;
  return Math.floor(Math.random() * (max - min)) + min;
  //The maximum is exclusive and the minimum is inclusive
}

function searchFromInput(e) {
  let city = e.target.value;

  query
    .fetchWeather(city)
    .then(data => {
      let keys = Object.values(data.sys.country).join('');
      fetchCovid(keys);

      if (data.cod === 200 && !findedCities.includes(data.name)) {
        refs.saveCityBtn.classList.remove('starred');
        fetchPixabay.searchQuery = data.name;
        fetchPixabayBgImg();

        citiesMemoryMarkUp = {
          name: data.name,
          html: memoryBuilder(data),
        };
        updatePageHtml(data);
      } else {
        citiesMemoryMarkUp = null;
      }
    })
    .catch(err => {
      const myError = error({
        delay: 2000,
        maxTextHeight: null,
        text: "CAN'T FIND YOUR REQUEST. PLEASE TRY AGAIN.",
      });
    });
}

function insertCityToTheMemory() {
  refs.saveCityBtn.classList.add('starred');
  let { value } = refs.input;

  if (!value || findedCities.includes(value)) {
    return;
  }

  refs.input.value = '';

  findedCities.push(value);

  const allLi = findedCities
    .map(
      city => `
        <div id=${city} class="btn-wrapper">
          <span class="added-city">${city}</span>
          <button class="cross-btn" data-id=${city}></button>
        </div>`,
    )
    .join('');

  refs.citiesContainer.innerHTML = allLi;

  // SET LOCAL STORAGE
  localStorage.setItem('Cities', JSON.stringify(findedCities));

  const mySiema = new Siema({
    perPage: findedCities.length > 4 ? 4 : findedCities.length,
    multipleDrag: true,
    selector: '.siema',
    easing: 'ease-out',
    draggable: true,
    width: 600,
    duration: 200,
    threshold: 20,
    startIndex: 0,
    loop: true,
    rtl: false,
    onInit: () => {},
    onChange: () => {},
  });

  document
    .querySelector('.right-click')
    .addEventListener('click', () => mySiema.next());
}

function removeCityFromMemory(e) {
  if (e.target && e.target.className === 'cross-btn') {
    let id = e.target.dataset.id;
    document.getElementById(id).remove();
    findedCities.splice(findedCities.indexOf(id), 1);
    // УДАЛЕНИE ЭЛЕМЕНТА ИЗ МАССИВА B ЛОКАЛЬНОM ХРАНИЛИЩE
    const cuttedArray = storedCities.splice(storedCities.indexOf(id), 1);
    localStorage.setItem('Cities', JSON.stringify(cuttedArray));
    if ((storedCities.length = 1)) {
      localStorage.clear();
    }
  }
}

function updatePageHtml(data) {
  if (data.cod === 200) {
    let img = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    let dt = new Date(data.dt * 1000);
    refs.weatherIcon.src = img;
    refs.weatherIcon.classList.add('visible');
    refs.weatherCity.textContent = `${data.name}, ${data.sys.country}`;
    refs.currentTemp.textContent = `${data.main.temp.toFixed(1)}`;
    refs.minTemp.textContent = `${data.main.temp_min.toFixed(1)}`;
    refs.maxTemp.textContent = `${data.main.temp_max.toFixed(1)}`;
    refs.currentDate.textContent = dt.getDate();
    refs.currentDay.textContent = dt.toLocaleDateString('en-US', {
      weekday: 'short',
    });
    refs.currentMonth.textContent = dt.toLocaleDateString('en-US', {
      month: 'long',
    });
    refs.currentTimeHr.textContent = String(dt.getHours()).padStart(2, 0) + ':';
    refs.currentTimeMin.textContent = String(dt.getMinutes()).padStart(2, 0);
    refs.sunrise.textContent =
      String(new Date(data.sys.sunrise * 1000).getHours()).padStart(2, 0) +
      ':' +
      String(new Date(data.sys.sunrise * 1000).getMinutes()).padStart(2, 0);
    refs.sunset.textContent =
      String(new Date(data.sys.sunset * 1000).getHours()).padStart(2, 0) +
      ':' +
      String(new Date(data.sys.sunset * 1000).getMinutes()).padStart(2, 0);
  }
}
