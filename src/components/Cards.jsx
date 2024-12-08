import React , {useEffect, useState} from 'react'
import ReactStars from 'react-stars';
import { carsRef } from './firebase/firebase';
import { Link } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';
import { getDocs } from 'firebase/firestore'; 
const Cards = () => {
 const [data, setData] = useState([]);
 const[loading, setLoading] = useState(false);

useEffect( () => {

    async function getData() {
        setLoading(true);
        const _data = await getDocs(carsRef)
        _data.forEach((doc) => {
            setData((prv) => [...prv, {...(doc.data()) , id:doc.id}])

        })
    setLoading(false)
    }
getData();
},[])

  return (
    <div className='flex flex-wrap justify-between px-3 mt-2 '>
 {loading ?  <div classname=" w-full flex justify-center items-center h-96"><ThreeDots height={40} color='white'/> </div> :
  data.map((e,i) => {

        return(
<Link to={`detail/${e.id}`}><div key={i} className='card zoom font-medium shadow-lg shadow-gray-500 bg-gray p-2   cursor-pointer mt-6  duration-500'> 

<img src={e.image} alt='' className="h-60 md:h-72" />
<h1>
    <span className='text-gray-500 '> Name:</span> {e.name}
</h1>

<h1 className='flex items-center'>

    <span className='text-gray-500'> Rating:</span> 
    <ReactStars
    size={20}
    half ={true}
    value ={5}
    edit={false}
    />
</h1>

<h1>
    <span className='text-gray-500'>Year:</span> {e.year}
</h1>

</div></Link>

        )
    })
}
    </div>
  )
}

export default Cards