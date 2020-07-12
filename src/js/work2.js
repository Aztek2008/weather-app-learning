import fetchWeather from '../api/weather';
import templateLi from '../templates/hbs-li.hbs';
import templateLiChild from '../templates/hbs-liChild.hbs';

const refs = {
  modal: document.querySelector('.list-modal'),
  days: document.querySelector('.list--days'),
  modalLink: document.querySelectorAll('.more-info'),
};

let dataList = [];

document.addEventListener('click', openModal);

function pad(obj) {
  return String(obj).padEnd(2, '0');
}

function openModal(e) {
  if (e.target && e.target.className === 'more-info') {
    const btn = e.target;
    refs.modal.textContent = '';

    dataList.forEach(value => {
      let dt = new Date(value.dt * 1000);
      console.log(value.weather);
      if (
        dt.toLocaleDateString('en-US', {
          weekday: 'long',
        }) === btn.dataset.id
      ) {
        refs.modal.insertAdjacentHTML(
          'beforeend',
          templateLiChild({
            icon: `http://openweathermap.org/img/wn/${value.weather[0].icon}@2x.png`,
            temp: value.main.temp,
            dayTime: `${String(dt.getHours()).padStart(2, 0)}:${String(
              dt.getMinutes(),
            ).padStart(2, 0)}`,
          }),
        );
      }
    });
  }
}

let city = 'Kyiv';

function buildPostFeed(data) {
  console.log(data);
  dataList = data.list;
  let arrDays = {};
  data.list.forEach(value => {
    let dt = new Date(value.dt * 1000);

    if (dt.getDay() !== new Date().getDay() || true) {
      let day = dt.toLocaleDateString('en-US', {
        weekday: 'long',
      });
      if (arrDays[day] === undefined) {
        arrDays[day] = {
          name: day,
          date: `${dt.getDate()} ${dt.toLocaleDateString('en-US', {
            month: 'short',
          })}`,
          icon: `http://openweathermap.org/img/wn/${value.weather[0].icon}@2x.png`,
          min: value.main.temp_min.toFixed(0),
          max: value.main.temp_max.toFixed(0),
        };
      } else {
        arrDays[day].min =
          arrDays[day].min > value.main.temp_min
            ? value.main.temp_min.toFixed(0)
            : arrDays[day].min;
        arrDays[day].max =
          arrDays[day].max < value.main.temp_max
            ? value.main.temp_max.toFixed(0)
            : arrDays[day].max;
      }
    }
  });
  for (let value in arrDays) {
    refs.days.insertAdjacentHTML('beforeend', templateLi(arrDays[value]));
  }
}

fetchWeather(city).then(data => {
  buildPostFeed(data);
});
