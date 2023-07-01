import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import "./App.css";
import { Player } from "@livepeer/react";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [asset, setAsset] = useState(null);
  const [droppedFileName, setDroppedFileName] = useState("");
  const [rootCid, setRootCid] = useState(null);

  const Delete = async () => {
    const deleteResponse = await axios.post(
      "http://localhost:3000/deleteVideo"
    );
    console.log(deleteResponse.data);
    setTimeout(() => {
      setMessages([...messages, "Video deleted from server"]);
    }, 5000);
    setLoading(false);
    const deleteResponse2 = await axios.post(
      "http://localhost:3000/deleteSnapshots"
    );
    console.log(deleteResponse2.data);
    setTimeout(() => {
      setMessages([...messages, "Snapshots deleted from server"]);
    }, 5000);
    setTimeout(() => {
      setMessages([]);
    }, 5000);
  };

  const onDrop = async (acceptedFiles) => {
    const videoFile = acceptedFiles[0];
    setDroppedFileName(videoFile.name);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("video", videoFile);

      const response = await axios.post(
        "http://localhost:3000/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log(response?.data?.uploadPath); // Handle the server response
      if (response?.data?.uploadPath) {
        const serverpath = response?.data?.uploadPath;

        const nsfwcheck = await axios.post("http://localhost:3000/nsfwcheck", {
          videoPath: serverpath,
        });
        console.log(nsfwcheck.data);
        if (nsfwcheck.data?.nsfwContent?.length === 1) {
          setLoading(false);
          setMessages([
            ...messages,
            "NSFW content not detected. Uploading asset to Livepeer...",
          ]);

          const assetResponse = await axios.post(
            "http://localhost:3000/uploadtolivepeer",
            {
              name: serverpath.slice(0, -4).split("/").pop(),
              description: "Test for NSFW content",
              videoUrl: serverpath,
            }
          );
          console.log("Asset uploaded to Livepeer");
          console.log(assetResponse.data.asset);
          setAsset(assetResponse.data.asset);
          setMessages([...messages, "Asset uploaded to Livepeer"]);

          const rootCidResponse = await axios.post(
            "http://localhost:3000/uploadtow3",
            { videoPath: serverpath }
          );
          console.log("Root CID uploaded to W3 Storage");
          console.log(rootCidResponse.data.rootCid);
          setRootCid(rootCidResponse.data.rootCid);
          setMessages([...messages, "Video uploaded to W3 Storage"]);
          await Delete();
        } else {
          setLoading(false);
          setMessages(["Cannot upload because your video has NSFW content"]);
          await Delete();
        }
      }
    } catch (error) {
      console.log(error); // Handle error
    }
  };

  console.log(messages);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="App">
      <h1>NSFW Content Detection</h1>
      <h2>Upload a video to check for NSFW content</h2>

      <div>
        <div
          {...getRootProps()}
          style={{
            padding: "20px",
            border: "1px dashed gray",
            marginTop: "30px",
          }}
        >
          <input {...getInputProps()} />
          <p>Drag and drop a file here, or click to select a file</p>
        </div>
        {droppedFileName && <p>File name: {droppedFileName}</p>}
        {loading && <p>Loading...</p>}
        {messages.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
        {asset?.[0]?.playbackId && (
          <>
            <Player title={asset[0].name} playbackId={asset[0].playbackId} />
            <p>Playback ID: {asset[0].playbackId}</p>
          </>
        )}
        {rootCid && (
          <div>
            <a href={`https://${rootCid}.ipfs.w3s.link/`} target="_blank">
              Root CID
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
