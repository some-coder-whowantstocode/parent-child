self.onmessage = async function (event) {
    try {
    var data = event.data;
    let stringdata = JSON.stringify(data);
        const result = await requestServer(stringdata);
        if(result) self.postMessage(result);

    } catch (error) {
    self.postMessage({success:false, err:"something went wrong with the worker."})
    }
};

async function requestServer(stringdata){
    try {
        const url = '/API/User/Auth';

        const response = await fetch(url,{
          method:'POST',
          headers:{
            "Content-Type":"application/json"
          },
          body:stringdata
        });
        const result = await response.json();
        console.log(result)
        return result;
    } catch (error) {
        console.log(error);
    self.postMessage({success:false, err:"something went wrong with the worker."})
    }
}