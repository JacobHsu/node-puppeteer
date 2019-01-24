function liveBetParser() {
    function getTableInfo() {
        let info = [];
        document.querySelectorAll('tr').forEach(item => {
            if (!item.innerText.includes('+場中投注')) return;

            console.log( item.innerText.split("\t") );
            const event = item.innerText.split("\t");
            // Subject,Start Date,Start Time,End Date,End Time,
            const theData = event[0].replace(/108/g,'2019')
            info.push({
              Subject: `${event[3]}:${event[4]} ${event[5]}`,
              StartDate: theData,
              StartTime: event[2],
              EndDate: theData,
              EndTime: event[2],
            });
          });

        return info;
    }
    return {
        postInfo: getTableInfo()
    };
}
module.exports = liveBetParser;