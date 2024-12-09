export async function ReadStream(body : ReadableStream){
    const streamdata = body;
    const reader = streamdata.getReader();
    const decoder = new TextDecoder('utf-8');
    let chunk = "";
    while(true){
        const {done, value} = await reader.read();
        if(done){
            break;
        }
        chunk += decoder.decode(value,{stream:true});
    }
    const data = JSON.parse(chunk);
    return data;
}