
const ActionButtonCaretDropDown = ({ defaultValue, changeHandler, deviceList, type }) => {
  let dropDownEl
  if (type === "video") {
    dropDownEl = deviceList.map(vd => <option key={vd.deviceId} value={vd.deviceId}>{vd.label}</option>)
  } else if (type === "audio") {
    const audioInputEl = []
    const audioOutputEl = []
    deviceList.forEach((device, index) => {
      if (device.kind === "audioinput") {
        audioInputEl.push(<option key={`input${device.deviceId}`} value={`input${device.deviceId}`}>{device.label}</option>)
      }
      else if (device.kind === "audiooutput") {
        audioOutputEl.push(<option key={`ouput${device.deviceId}`} value={`ouput${device.deviceId}`}>{device.label}</option>)
      }
    })
    audioInputEl.unshift(<optgroup label="Input Devices" />)
    audioOutputEl.unshift(<optgroup label="Out Devices" />)
    dropDownEl = audioInputEl.concat(audioOutputEl)
  }

  return (
    <div className="caret-dropdown" style={{ top: "-25px" }}>
      <select defaultValue={defaultValue} onChange={changeHandler}>
        {dropDownEl}
      </select>
    </div>
  )
}
export default ActionButtonCaretDropDown