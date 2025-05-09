// async function download_image(url) {
//   try {
//     // Make the request with CORS disabled
//     const response = await fetch(url);
//     console.log('response', response)

//     // Check if the response is OK
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     // Convert the response to a blob
//     const blob = await response.blob();

//     // Create a temporary link element
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'image_' + Date.now() + '.jpg'; // Default filename
//     link.click();

//     // Clean up
//     URL.revokeObjectURL(link.href);

//     console.log('Image downloaded successfully!');
//   } catch (error) {
//     console.error('Failed to download image:', error.message);
//   }
// }


// async function download_image(imageSrc) {
//   const response = await fetch(imageSrc)
//   console.log('response', response)
//   const imageBlog = await response.blob()
//   console.log('imageBlog', imageBlog)
//   const imageURL = URL.createObjectURL(imageBlog)
//   console.log('imageURL', imageURL)

//   const link = document.createElement('a')
//   link.href = imageURL
//   link.download = 'image file name here'
//   document.body.appendChild(link)
//   link.click()
//   document.body.removeChild(link)
// }

async function download_image(imageSrc) {
  try {
    const response = await fetch(imageSrc, {
      // Change header to headers here
      headers: {
        "Content-Type": "image/jpeg",
      },
    });
    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Convert the response to a blob
    const blob = await response.blob();
    console.log('blob', blob)
    // Get the filename from the Content-Disposition header
    let filename;
    const disposition = response.headers.get('Content-Disposition');
    if (disposition && disposition.includes('filename=')) {
      [filename] = disposition.split('filename=');
      filename = filename.replace(/"/g, '');
    } else {
      // Fallback to using the last part of the URL as filename
      filename = imageSrc.split('/').pop();
    }

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    // Trigger the download
    link.click();

    // Clean up
    URL.revokeObjectURL(link.href);

    console.log('Image saved successfully!');
  } catch (error) {
    console.error('Failed to save image:', error.message);
  }
}

function startDownload() {
  let imageURL =
    "https://cdn.glitch.com/4c9ebeb9-8b9a-4adc-ad0a-238d9ae00bb5%2Fmdn_logo-only_color.svg?1535749917189";
  let imageDescription = "The Mozilla logo";

  let downloadedImg = new Image();
  console.log('downloadedImg', downloadedImg)
  downloadedImg.crossOrigin = "anonymous";
  downloadedImg.addEventListener("load", imageReceived, false);
  downloadedImg.alt = imageDescription;
  downloadedImg.src = imageURL;
  console.log('downloadedImg', downloadedImg)

  return downloadedImg
}

function imageReceived(downloadedImg) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = downloadedImg.width;
  canvas.height = downloadedImg.height;
  canvas.innerText = downloadedImg.alt;

  context.drawImage(downloadedImg, 0, 0);
  imageBox.appendChild(canvas);

  try {
    localStorage.setItem("saved-image-example", canvas.toDataURL("image/png"));
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}


export {
    download_image,
    startDownload
}