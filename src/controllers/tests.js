const arr = [
  {
    _id: '662',
    teste: '2',
  },
  {
    _id: '663',
    teste: '3',
  },
  {
    _id: '664',
    teste: '4',
  },
  {
    _id: '665',
    teste: '5',
  },
];

// const teste = arr.filter((item) => item._id == '665');
// teste[0];
const index = arr.findIndex((item) => item._id == '6845');
// arr[index] = { _id: '662', teste: '22' };
arr.splice(index, 1);

console.log(arr);
