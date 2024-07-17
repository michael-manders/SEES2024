function calcIdealDayAverage(lat, lon, date = new Date()) {
    const solarConstant = 1361; // Solar constant in W/m^2

    // Convert latitude to radians
    const latRad = (lat * Math.PI) / 180;

    // Calculate day of the year
    const start = new Date(date.getFullYear(), 0, 0);
    const diff =
        date -
        start +
        (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    // Calculate declination angle (δ) in radians
    const declination =
        ((23.44 * Math.PI) / 180) *
        Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365);

    // Calculate solar hour angle (H) at solar noon (in radians)
    const solarNoon = 12; // 12 PM local solar time
    const H = ((solarNoon - 12) * 15 * Math.PI) / 180;

    // Calculate solar zenith angle (θ)
    const cosTheta =
        Math.sin(latRad) * Math.sin(declination) +
        Math.cos(latRad) * Math.cos(declination) * Math.cos(H);
    const theta = Math.acos(cosTheta);

    // Calculate peak energy (assuming clear sky)
    const peakEnergy = solarConstant * cosTheta;

    // Average energy over a day (simplified estimation)
    const averageEnergy =
        (solarConstant / Math.PI) *
        (Math.sin(latRad) * Math.sin(declination) +
            (Math.PI / 24) * Math.cos(latRad) * Math.cos(declination));

    // Minimum energy
    const minEnergy = 0; // Minimum energy at night

    return averageEnergy;
}

function getData(lat, lon) {
    // https://power.larc.nasa.gov/api/temporal/daily/point?start=20240701&end=20240701&latitude=55.226&longitude=-69.4018&community=RE&parameters=ALLSKY_SFC_SW_DWN,CLRSKY_SFC_SW_DWN&format=JSON&theme=light&user=DAVE
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const START = `${year - 2}0101`;
    const END = `${year}0101`;

    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?start=${START}&end=${END}&latitude=${lat}&longitude=${lon}&community=RE&parameters=ALLSKY_SFC_SW_DWN,CLRSKY_SFC_SW_DWN&format=JSON&theme=light&user=DAVE`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            const real = data.properties.parameter.ALLSKY_SFC_SW_DWN;
            const ideal = data.properties.parameter.CLRSKY_SFC_SW_DWN;

            let realData = [];
            let idealData = [];
            let dates = [];

            for (let i in data.properties.parameter.ALLSKY_SFC_SW_DWN) {
                const realVal = data.properties.parameter.ALLSKY_SFC_SW_DWN[i];
                const idealVal = data.properties.parameter.CLRSKY_SFC_SW_DWN[i];

                realData.push(realVal);
                idealData.push(idealVal);
                dates.push(i);
            }

            const realSum = realData.reduce((a, b) => a + b, 0);
            const idealSum = idealData.reduce((a, b) => a + b, 0);

            const realAvg = realSum / realData.length;
            const idealAvg = idealSum / idealData.length;

            const realPeak = Math.max(...realData);
            const idealPeak = Math.max(...idealData);

            const realMin = Math.min(...realData);
            const idealMin = Math.min(...idealData);

            console.log("Real average: ", realAvg);
            console.log("Ideal average: ", idealAvg);

            outputStr = `Real average: ${realAvg.toFixed(
                2
            )} kWh/m^2 per day\nIdeal average: ${idealAvg.toFixed(
                2
            )} kWh/m^2 per day\n\nReal peak: ${realPeak.toFixed(
                2
            )} kWh/m^2 per day\nIdeal peak: ${idealPeak.toFixed(
                2
            )} kWh/m^2 per day\n\nReal min: ${realMin.toFixed(
                2
            )} kWh/m^2 per day\nIdeal min: ${idealMin.toFixed(
                2
            )} kWh/m^2 per day`;

            document.getElementById("results").innerText = outputStr;

            dates = dates.map((date) => {
                return `${parseInt(date / 10000)}/${
                    parseInt(date / 100) % 100
                }/${date % 100}`;
            });

            makeChart(dates, idealData, realData);
        });
}

function makeChart(xValues, idealData, realData) {
    new Chart("chart", {
        type: "line",
        data: {
            labels: xValues,
            datasets: [
                {
                    data: idealData,
                    borderColor: "red",
                    fill: false,
                    label: "Clear Sky Ideal",
                },
                {
                    data: realData,
                    borderColor: "blue",
                    fill: false,
                    label: "Real",
                },
            ],
        },
        options: {
            legend: { display: true },
        },
    });
}
