import axios from "axios";



const axiosapi= axios.create({ 

    baseURL:'http://localhost:5000',
    headers:{
        'Content-Type':'application/json'
    }
});

export default axiosapi;