
import React, { useState, useEffect } from 'react';
import ReactStars from 'react-stars';
import { useParams } from 'react-router-dom';
import { db } from "./firebase/firebase";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ThreeCircles } from 'react-loader-spinner';
import Reviews from './Reviews';

const Detail = () => {
  const { id } = useParams(); // Get the car ID from the URL
  const [data, setData] = useState({
    title: "",
    year: "",
    image: "",
    description: "",
    rating: 0,
    rated: 0
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // State to manage modal visibility
  const [form, setForm] = useState({
    title: "",
    year: "",
    image: "",
    description: ""
  });

  useEffect(() => {
    async function getData() {
      setLoading(true);
      const _doc = doc(db, "cars", id);
      const _data = await getDoc(_doc);
      setData(_data.data());
      setForm(_data.data()); // Set initial form state with current car data
      setLoading(false);
    }
    getData();
  }, [id]);

  // Open modal to edit car details
  const openModal = () => {
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  // Handle update button click to update car data
  const updateCar = async () => {
    try {
      const carRef = doc(db, "cars", id);
      await updateDoc(carRef, form); // Update Firestore document
      closeModal(); // Close modal
      alert("Car updated successfully!"); // Optionally show a success message
    } catch (error) {
      console.error("Error updating car: ", error);
      alert("Error updating car.");
    }
  };

  return (
    <div className='p-4 mt-4 flex flex-col md:flex-row items-center md:items-start w-full justify-center'>
      {loading ? (
        <div className='h-96 flex w-full justify-center items-center'>
          <ThreeCircles height={30} color="white" />
        </div>
      ) : (
        <>
          <img className='h-96 block md:sticky top-24' src={data.image} alt='' />

          <div className='md:ml-4 ml-0 w-full md:w-1/2'>
            <h1 className='text-3xl font-bold text-gray-400'>
              {data.title} <span className='text-xl'>({data.year})</span>
            </h1>

            <ReactStars
              size={20}
              half={true}
              value={data.rating / data.rated}
              edit={false}
            />

            <p className='mt-2'>{data.description}</p>

            <Reviews id={id} prevRating={data.rating} userRated={data.rated} />

            {/* Button to open the modal */}
            <div className="mt-4">
              <button
                onClick={openModal}
                className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Update Car
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal to edit the car details */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">Update Car</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                <input
                  type="text"
                  id="year"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image Link</label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-between">
                <button
                  onClick={updateCar}
                  className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Update
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detail;
