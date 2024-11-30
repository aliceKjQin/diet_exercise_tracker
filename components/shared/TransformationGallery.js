import React from "react";
import UploadImage from "../../app/progress/UploadImage";
import Loading from "./Loading";

export default function TransformationGallery({
  images,
  dietName,
  addNewImage,
  deleteImage,
  isActive,
}) {
  return (
    <div className="w-full overflow-x-auto p-4 whitespace-nowrap bg-indigo-400 rounded-lg shadow-md text-white">
      {/* Title */}
      <h2 className="font-bold">
        <i className="fa-solid fa-camera-retro mr-2"></i>Document Your
        Transformation
      </h2>

      {/* Images and Upload Button */}
      <div className="inline-flex gap-1">
        {images.map((image, index) => (
          <div key={index} className="inline-block w-[270px] p-2 mr-4">
            <div className="flex flex-col items-center gap-2">
              {/* div for image date and delete button */}
              <div className="flex items-center p-1 gap-2">
                <p className="text-sm mr-2">{image.date}</p>
                {isActive && <button
                  onClick={() => deleteImage(image)}
                  disabled={image.deleting}
                >
                  <i className="fa-solid fa-trash-can text-indigo-300 hover:text-red-400"></i>
                </button>}
              </div>
              {/* display loading or error on deleting  */}
              {image.deleting && <Loading />}
              {image.deleteError && (
                <p className="text-center text-red-200">
                  {" "}
                  <i class="fa-regular fa-circle-xmark fa-lg mr-1"></i>
                  {image.deleteError}
                </p>
              )}

              <img
                src={image.url}
                alt={`Progress Image ${index}`}
                className="w-full h-[320px] object-cover rounded-lg ring ring-lime-300 bg-white"
              />
            </div>
          </div>
        ))}
        {/* Upload Image Button */}
        {isActive && (
          <div className="inline-block w-[270px] h-[300px] p-2 mt-8">
            <UploadImage dietName={dietName} onNewImageUpload={addNewImage} />
          </div>
        )}
      </div>
    </div>
  );
}
