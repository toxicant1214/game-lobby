/* 島嶼時光局 v17.5：全部瀏覽器存檔 I/O 集中於此。 */
const SaveStorage = Object.freeze({
  read(key) { return window.localStorage.getItem(key); },
  write(key, value) { window.localStorage.setItem(key, value); },
  remove(key) { window.localStorage.removeItem(key); },
  serialize(value, pretty = false) { return JSON.stringify(value, null, pretty ? 2 : undefined); },
  parse(text) { return JSON.parse(text); }
});
