export function clean(arr) {
  for (let i = 0; i < arr.length; ++i) {
    if (!arr[i]) {
      arr.splice(i, 1);
      --i;
    }
  }
  return arr;
}

export default {
  clean
};
