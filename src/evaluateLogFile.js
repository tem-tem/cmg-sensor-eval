const DEFAULT_DEVICE_REF_SEQUENCE = ['thermometer', 'humidity', 'monoxide'];

// options structure: {
//   additionalReferences -- array with additional device types
//   [deviceType].evaluationFunction -- fn that accepts array of values found in logs, and a ref value
// }
export default function evaluateLogFile(logContentsStr, options) {
  let lines = logContentsStr.split('\n');
  const currentDevice = { type: null, name: null, values: [] };
  const refParams = buildReferenceParams(options);
  const evaluationOutput = {};

  lines.forEach(function (line) {
    const words = line.split(" ");
    switch (words[0]) {
      case "reference":
        refParams.referenceSequence.forEach((device, i) => {
          refParams.referenceByDevice[device].value = Number(words[i+1]);
        })
        break;

      default:
        if (!isNaN(Date.parse(words[0]))) {
          currentDevice.values.push(Number(words[1]));
          break;
        }

        if (currentDevice.type) {
          evaluationOutput[currentDevice.name] = calcDeviceEvaluation(currentDevice, refParams);
        }
        setCurrentDevice(currentDevice, words);
        break;

    }
  });
  evaluationOutput[currentDevice.name] = calcDeviceEvaluation(currentDevice, refParams);
  return evaluationOutput;
}

const setCurrentDevice = (device, words) => {
  device.type = words[0];
  device.name = words[1];
  device.values = [];
}

const calcDeviceEvaluation = (device, refParams) => {
  if (device.type) {
    if (refParams.referenceByDevice[device.type] && refParams.referenceByDevice[device.type].evaluationFunction) {
      const deviceEvaluationFn = refParams.referenceByDevice[device.type].evaluationFunction;
      const deviceReferenceValue = refParams.referenceByDevice[device.type].value;
      return deviceEvaluationFn(device.values, deviceReferenceValue);
    } else {
      return `${device.type} reference params not found; evaluation skipped`;
    }
  }
}

const buildReferenceParams = (options) => {
  const referenceByDevice = {};
  const referenceSequence = DEFAULT_DEVICE_REF_SEQUENCE;
  if (options && options.additionalReferences) referenceSequence.push(...options.additionalReferences);
  referenceSequence.forEach(deviceType => {
    referenceByDevice[deviceType] = {};
    referenceByDevice[deviceType].value = null;
    switch (deviceType) {
      case "monoxide":
        referenceByDevice[deviceType].evaluationFunction = monoxide;
        break;
      case "humidity":
        referenceByDevice[deviceType].evaluationFunction = humidity;
        break;
      case "thermometer":
        referenceByDevice[deviceType].evaluationFunction = thermometer;
        break;
      default:
        break;
    }
    if (options && options[deviceType] && options[deviceType].evaluationFunction) {
      referenceByDevice[deviceType].evaluationFunction = options[deviceType].evaluationFunction
    };
  })
  return {referenceSequence, referenceByDevice}
}

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