import './App.css';
import React, { useState,useEffect } from 'react';
import {initializeApp} from "firebase/app";
import {doc, getFirestore, setDoc, where, collection , query, getDocs,onSnapshot} from 'firebase/firestore'
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

function App() {
  var [loginPage,setloginPage] = useState(true);
  var [homePage,sethomePage] = useState(false);
  var [error,setError] = useState(false);
  var [email,setEmail] = useState(" ");
  var [name,setName ] = useState(" ");
  var [deviceMac,setdeviceMac ] = useState(0);
  var [deviceName,setdeviceName ] = useState(" ");
  var [deviceList,setdeviceList] = useState([]);
  var [newDevicePage, setnewDevicePage] = useState(false);
  var [devicePage,setDevicePage] = useState(false);
  var [selectedDeviceName,setselectedDeviceName] = useState("");
  var [selectedDeviceMac,setselectedDeviceMac] = useState(0);
  var [selectedDeviceCount,setselectedDeviceCount] = useState(-1);
  var [selectedDeviceThreshold,setselectedDeviceThreshold] = useState(999);
  var [backPage,setBackPage] = useState();

  const firebaseConfig = {
    apiKey: "AIzaSyDcfcSm56FRjWc4zFryx-QtOAtojlyLACE",
    authDomain: "facemaskdetector-987ed.firebaseapp.com",
    projectId: "facemaskdetector-987ed",
    storageBucket: "facemaskdetector-987ed.appspot.com",
    messagingSenderId: "1090108636955",
    appId: "1:1090108636955:web:3873421abb22dfda091dbe"
  };

  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const db = getFirestore()
  
  const openSignInPopUp = ()=>{
    
    signInWithPopup(auth, provider)
    .then((result) => {

      setError(false);

      setName(result.user.displayName);
    
      setEmail(result.user.email);

      _F_setName(result.user.displayName,result.user.email)

      
      loadhomePage(result.user.email)
    }).catch(() => {
     
      setError(true);
      setloginPage(false);
      sethomePage(false);
      setnewDevicePage(false);
    });
  };

  useEffect(() => { 
    
    const unsubscribe = onSnapshot(collection(db, "devices"),snap => {
      const data = snap.docs.map(doc => doc.data())
      setselectedDeviceCount(data[0].count)
      setselectedDeviceThreshold(data[0].threshold)
      console.log(data[0].count+" "+data[0].threshold)
      if(data[0].count >= data[0].threshold  && email != " ")
      {
        
      }
    })

    return () => unsubscribe()
  
  }, []);

  const _F_setName = (name,email)=>{
    const userRef = doc(db,'users',email)
    setDoc(userRef,{ 'name': name})
  }

  const loadhomePage = (e) =>{
    new Promise(()=>{
      _F_getDevices(e)
    });
    sethomePage(true);
    setloginPage(false);
    setnewDevicePage(false);
  }

  const _F_getDevices = async(email)=>{
    const deviceRef = collection(db,"devices");
    const q = query(deviceRef,where("email","==",email));
    const snap = await getDocs(q);
    let list = [];
    snap.forEach((doc) => {
      list.push(doc.data())
    });
    
    setdeviceList(list)
  }

  const loadregisterDevicePage = () =>{ 
      setnewDevicePage(true);
      setError(false);
      setloginPage(false);
      sethomePage(false);
  };


  const registerDevice = () =>{ 
    addDevice(deviceMac).then(()=>{
      setdeviceMac(0);
      loadhomePage(email)
    })
  }

  const addDevice = async(mac)=>{
    const deviceRef = collection(db,"devices");
    const q = query(deviceRef, where("mac","==",parseInt(mac)));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const deviceRef = doc(db,'devices',d.id)
      setDoc(deviceRef,{ 'email' : email, 'name' : deviceName,'threshold':1},{merge:true})
    }); 
  }

  const handleMacAddress = (value) =>{
    setdeviceMac(value)
  };

  const handleDeviceName = (value) =>{
    setdeviceName(value)
  };

  const handleThreshold = (value) =>{
    setselectedDeviceThreshold(parseInt(value))
  };

  const loadDevicePage = (mac,name,threshold) =>{
    setError(false);
    setloginPage(false);
    sethomePage(false);
    setnewDevicePage(false);
    setDevicePage(true);
    setselectedDeviceMac(mac)
    setselectedDeviceName(name)
    setselectedDeviceThreshold(threshold)
  }

  const setThreshold = async(mac)=>{
    const deviceRef = collection(db,"devices");
    const q = query(deviceRef, where("mac","==",parseInt(mac)));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const deviceRef = doc(db,'devices',d.id)
      setDoc(deviceRef,{ 'threshold': selectedDeviceThreshold},{merge:true})
    }); 
  }

  const goBack = ()=>{
    
  }

  return (
    <div className="App">
        {loginPage&&<div className='login'>
          <img src={require('./icon.png')} height='100vh' width='100vw' onClick={openSignInPopUp}></img>
          <p style={{color:'#0055CC'}}>Sign In</p>
          {error&&<p>Something went wrong!</p>}
        </div>}
        {homePage&&<div className='homepage'>
          <h1>Welcome,{name} </h1>
          
          {deviceList.map(item=>(
            <div style={{border:'1px solid black',padding:'2%',boxShadow:'1px 5px'}}>
              <h4>Mac Address : {item.mac}</h4>
              <h4>Name : {item.name}</h4>
              <br></br>
              <Button style={{marginTop:'10px',color:'#0055CC',borderColor:'blue',fontWeight:'bold'}} variant="outlined" onClick={()=>{loadDevicePage(item.mac,item.name,item.threshold)}}>Click Here</Button>
            </div>
          ))}   
         
          <Button style={{marginTop:'10px',backgroundColor:'#0055CC',borderColor:'blue'}} variant="contained" onClick={loadregisterDevicePage}>Add New Device</Button>
        </div>}
        {newDevicePage&&<div className='homepage'>
          <h1>Enter Device Mac Address </h1>
          <TextField  style={{marginTop:'10px'}}  label="Mac Address" value={deviceMac} onChange={e => handleMacAddress(e.target.value)}  variant="outlined" name="deviceMac"/>
          <TextField  style={{marginTop:'10px'}} label="Name" value={deviceName} onChange={e => handleDeviceName(e.target.value)} name="deviceName" variant="outlined"/>
          <Button style={{marginTop:'10px'}}variant="contained" onClick={registerDevice}>Add</Button>
          <Button style={{marginTop:'50px'}} onClick={loadhomePage} variant="contained">Back</Button>
        </div>}
        {devicePage&&<div className='homepage'>
            <h1>Device Name : {selectedDeviceName}</h1>
            <h1>Count : {selectedDeviceCount}</h1>
            <TextField  style={{marginTop:'10px'}}  label="Threshold" value={selectedDeviceThreshold} onChange={e => handleThreshold(e.target.value)}  variant="outlined" name="deviceMac"/>
            <Button style={{marginTop:'10px'}} variant="contained" onClick={()=>{setThreshold(selectedDeviceMac)}}>Submit</Button>
            <Button style={{marginTop:'50px'}} onClick={loadhomePage}variant="contained">Back</Button>
        </div>}
    </div>
  );
}

export default App;
