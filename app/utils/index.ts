export const sleep = (time:number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('time is up')
    }, time);
  })
}