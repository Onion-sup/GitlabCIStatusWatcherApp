module.exports = (type) => {
    console.log("setIntervalTask", type)
}
    // if(type === 'stop') {
    //     global.interval && clearInterval(global.interval);
    //     return null;
    // }
    // global.interval = setInterval(console.log, 2000, 'I am set Interval js task');
    // };

// module.exports = async (taskData) => {
//     console.log("bg task process")
//     global.interval = setInterval(console.log, 2000, 'I am set Interval js task');
//     };