import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { BASE_URL } from "@env";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Dropdown } from "react-native-element-dropdown";

const conferenceRooms = [
  { label: "Conference Room 1", value: 1 },
  { label: "Conference Room 2", value: 2 },
  { label: "Conference Room 3", value: 3 },
  { label: "Conference Room 4", value: 4 },
  { label: "Conference Room 5", value: 5 }
];
export default function App() {

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState("Not yet scanned");
  const axios = require("axios");
  const [value, setValue] = React.useState(null);
  const [Focus, setFocus] = React.useState(false);
  const checkTicket = 'http://conferenceticketlb-354391346.us-east-1.elb.amazonaws.com/api/ticket/check-ticket?'
  const registerParcitipation = 'http://conferenceticketlb-354391346.us-east-1.elb.amazonaws.com/api/ticket/register-parcitipation'
  var qrId;
  var qrHash;
  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  };

  // Request Camera Permission
  useEffect(() => {
    askForCameraPermission();
  }, []);

  const format = async (qrCode) => {
    const split = qrCode.split("/");
    const id = split[6];
    qrId = parseInt(id);
    qrHash = qrCode.split('/').splice(7).join('/')
    console.log('qrId', qrId, 'qrHash', qrHash)
  }

  const scanTicket = async (ticket_id) => {
    console.log("Scanning Ticket");
    format(ticket_id); 
  
    const checkTicket = 'http://conferenceticketlb-354391346.us-east-1.elb.amazonaws.com/api/ticket/check-ticket?'
    const registerParcitipation = 'http://conferenceticketlb-354391346.us-east-1.elb.amazonaws.com/api/ticket/register-parcitipation'
     
    console.log('get', checkTicket + 'Id=' + qrId + '&hash=' + qrHash)
    try {
      const responsecheckTicket = await axios.get(checkTicket + 'Id=' + qrId + '&hash=' + qrHash,
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
          }
        });
      const isRegistred = responsecheckTicket.data;
      console.log('isRegistred', isRegistred)
     
      if(value === null){
        setText("Please choose a conference room");
        return 
      }
      
      if (isRegistred === 0) {
        setText("User not registered, check in with registration desk");
        return
      }
    
      const obj = {
        roomNo: value,
        ticketId: qrId,
      }

      const objJson = JSON.stringify(obj);
      console.log('objJson', objJson)
       
      const responseRegister = await axios.post(registerParcitipation, objJson,
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Content-Type': 'application/json'
          }
        });
        
        setText("OK, User has been registered.");
      console.log('responseRegister', responseRegister.status)
    } catch (error) {
      setText("503 Service Temporarily Unavailable");
      console.log('error', error.response)
    }
  };

  // What happens when we scan the bar code
  const handleBarCodeScanned = ({ type, data }) => {
    scanTicket(data);
    setScanned(true);
    setText("Scanning....");
  };

  // Check permissions and return the screens
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting for camera permission</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ margin: 10 }}>No access to camera</Text>
        <Button
          title={"Allow Camera"}
          onPress={() => askForCameraPermission()}
        />
      </View>
    );
  }

  // Return the View
  return (
    <View style={styles.container}>
      <View style={styles.barcodebox}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={{ height: 400, width: 400 }}
        />


      </View>
      <Text style={styles.maintext}>{text}</Text>
      <Text>  {"\n"} </Text>

      <Dropdown
        data={conferenceRooms}
        style={[styles.dropdown, Focus && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!Focus ? 'Select Conferenc Room' : '...'}
        searchPlaceholder="Search..."
        value={value}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={item => {
          setValue(item.value);
          setFocus(false);
        }}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={Focus ? 'blue' : 'black'}
            name="Safety"
            size={20}
          />
        )}
      />
      <Text>  {"\n"} </Text>
      {scanned && (
        <Button
          title={"Scan again?"}
          onPress={() => setScanned(false)}
          color="green"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
  barcodebox: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
    width: 300,
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "tomato",
  }, dropdown: {
    height: 50,
    width: 300,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 20,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
