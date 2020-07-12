const baseUrl =
  'https://pixabay.com/api/?image_type=photo&orientation=horizontal&category=places,buildings';
// ЗАМЕНИТЬ ПИКСАБЭЙ НА ГУГЛ АПИ

export default {
  query: '',
  key: '16836748-77bdb9d8e6a7ff11ccb0a1780',

  fetchBgImage() {
    return fetch(`${baseUrl}&q=${this.query}&key=${this.key}`).then(response =>
      response.json(),
    );
  },

  get searchQuery() {
    return this.query;
  },

  set searchQuery(string) {
    this.query = string;
  },
};
