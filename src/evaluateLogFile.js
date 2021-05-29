export default function evaluateLogFile(logContentsStr, options) {
  let lines = logContentsStr.split('\n');
  const references = { thermometer: null, humidity: null, monoxide: null };
  const currentDevice = { type: null, name: null, values: [] };
  const deviceEval = {};

  // debugger;
  const checkAndEval = (device, refs) => {
    if (device.type) {
      return evalDevice(device, refs);
    }
  }
  const resetCurrentDevice = (device, words) => {
    device.type = words[0];
    device.name = words[1];
    device.values = [];
  }
  lines.forEach(function (line) {
    const words = line.split(" ");
    switch (words[0]) {
      case "reference":
        references.thermometer = Number(words[1]);
        references.humidity = Number(words[2]);
        references.monoxide = Number(words[3]);
        break;

      case "monoxide":
      case "humidity":
      case "thermometer":
        deviceEval[currentDevice.name] = checkAndEval(currentDevice, references)
        resetCurrentDevice(currentDevice, words)
        break;

      default:
        // TODO: this is a weak point -- could be a date+value or any other shit
        if (!isNaN(Date.parse(words[0]))) {
          currentDevice.values.push(Number(words[1]));
        }
    }
  });
  deviceEval[currentDevice.name] = evalDevice(
    currentDevice,
    references
  );
  return deviceEval;
}

const evalDevice = (device, references) => {
  switch (device.type) {
    case "monoxide":
      return monoxide(device.values, references.monoxide);
    case "humidity":
      return humidity(device.values, references.humidity);
    case "thermometer":
      return thermometer(device.values, references.thermometer);
  }
};

const thermometer = (valuesArray, ref) => {
  const mean =
    valuesArray.reduce((sum, val) => sum + val) / valuesArray.length;
  if (Math.abs(mean - ref) > 0.5) return "precise";
  const deviation = getStandardDeviation(valuesArray);
  if (deviation < 3)
    return "ultra precise";
  if (deviation < 5)
    return "very precise";
  return "precise";
}

const humidity = (values, ref) => {
  let evalRes = "keep";
  values.forEach((val) => {
    const difference = Math.abs(ref - val);
    if (difference > 1) evalRes = "discard";
  });
  return evalRes;
}

const monoxide = (values, ref) => {
  let evalRes = "keep";
  values.forEach((val) => {
    const difference = Math.abs(ref - val);
    if (difference > 3) evalRes = "discard";
  });
  return evalRes;
}

// https://stackoverflow.com/questions/7343890/standard-deviation-javascript
function getStandardDeviation(array) {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(
    array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
  );
}