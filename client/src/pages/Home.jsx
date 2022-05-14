import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { format } from "timeago.js";
import Map, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import styled from "styled-components";
import RoomRoundedIcon from "@mui/icons-material/RoomRounded";
import Star from "@mui/icons-material/Star";

const theme = {
  author: "Crimson",
  users: "DarkBlue",
  rating: "Gold",
};

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  width: 200px;
  height: 100%;

  label {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 5px;
    color: ${(props) => props.theme.author};
    border-bottom: 3px solid;
  }

  h4 {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 5px;
  }

  p {
    font-size: 14px;
    margin-bottom: 5px;
  }

  div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 20px;
    margin-bottom: 5px;
  }
`;

const Author = styled.div`
  font-size: 12px;
  margin-bottom: 5px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  height: 100%;

  label {
    font-size: 14px;
    margin-bottom: 5px;
    color: crimson;
    border-bottom: 3px solid;
  }

  input {
    font-size: 14px;
    border: none;
    outline: none;
    margin-bottom: 5px;
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    align-content: center;
  }

  textarea {
    font-size: 14px;
    outline: none;
    padding: 5px;
  }

  Select {
    font-size: 14px;
    border: none;
    outline: none;
    margin-bottom: 5px;
  }

  button {
    font-size: 14px;
    margin-bottom: 5px;
    padding: 5px;
    background-color: transparent;
    border: 0.5px solid black;
    transition: all 0.2s ease-in-out;
    border-radius: 5px;
    font-weight: bold;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: black;
      color: crimson;
      cursor: pointer;
      transform: scale(1);
      transition: all 0.2s ease-in-out;
    }
  }
`;

function Home() {
  const currentUser = "Marcus";
  const [pins, setPins] = useState([]);
  const [viewState, setViewState] = useState({
    longitude: -39.462891,
    latitude: 35.746512,
    zoom: 3,
  });
  const [selectedPin, setSelectedPin] = useState(null);
  const [location, setLocation] = useState(null);
  const mapRef = useRef();
  const titleRef = useRef();
  const descRef = useRef();
  const ratingRef = useRef();

  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await axios.get("/pins");
        setPins(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);

  const handleMarkerClick = (id, lat, lon) => {
    setSelectedPin(id);
    mapRef.current?.flyTo({ center: [lon, lat], duration: 2002 });
  };

  const handleAddClick = (e) => {
    e.originalEvent.stopPropagation();
    const { lng, lat } = e.lngLat;
    setLocation({ lat: lat, lon: lng });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      name: currentUser,
      title: titleRef.current.value,
      description: descRef.current.value,
      rating: ratingRef.current.value,
      lat: location.lat,
      lon: location.lon,
    };
    try {
      const res = await axios.post("/pins", newPin);
      setPins([...pins, res.data]);
      setLocation(null);
      setSelectedPin(res.data._id);
      mapRef.current?.flyTo({
        center: [location.lon, location.lat],
        duration: 2002,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Map
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      style={{ width: "100vw", height: "100vh" }}
      mapStyle="mapbox://styles/mapbox/light-v9"
      mapboxAccessToken={process.env.REACT_APP_MAPBOX}
      onDblClick={(e) => {
        handleAddClick(e);
      }}
      ref={mapRef}
    >
      {pins.map((pin) => (
        <div key={pin._id}>
          <Marker
            theme={theme}
            longitude={pin.lon}
            latitude={pin.lat}
            offsetLeft={-viewState.zoom * 3.5}
            offsetTop={-viewState.zoom * 7}
            onClick={(e) => {
              // If we let the click event propagates to the map, it will immediately close the popup
              // with `closeOnClick: true`
              e.originalEvent.stopPropagation();
              handleMarkerClick(pin._id, pin.lat, pin.lon);
            }}
          >
            <RoomRoundedIcon
              sx={{
                color: currentUser === pin.name ? theme.author : theme.users,
                fontSize: viewState.zoom * 7,
                "&:hover": {
                  transform: "scale(1.1)",
                  cursor: "pointer",
                  filter: "brightness(1.5)",
                },
              }}
            />
          </Marker>
          {pin._id === selectedPin && (
            <Popup
              longitude={pin.lon}
              latitude={pin.lat}
              anchor="bottom-right"
              focusAfterOpen={false}
              closeOnClick={true}
              onClose={() => setSelectedPin(null)}
              offsetTop={-10}
              offsetLeft={-20}
            >
              <Card theme={theme}>
                <label>Place</label>
                <h4>{pin.title}</h4>
                <label>Review</label>
                <p>{pin.description}</p>
                <label>Rating</label>
                <div>
                  {[...Array(pin.rating)].map((_, i) => (
                    <Star
                      key={i}
                      sx={{
                        color: theme.rating,
                        "&:hover": {
                          transform: "scale(1.1)",
                          cursor: "pointer",
                          filter: "brightness(1.5)",
                        },
                      }}
                    />
                  ))}
                </div>
                <Author>
                  Created by<b>&nbsp;{pin.name}</b>
                </Author>
                <span>{format(pin.createdAt)}</span>
              </Card>
            </Popup>
          )}
          {location && (
            <Popup
              longitude={location.lon}
              latitude={location.lat}
              anchor="bottom-right"
              focusAfterOpen={false}
              closeOnClick={true}
              onClose={() => setLocation(null)}
              offsetTop={-10}
              offsetLeft={-20}
            >
              <Form onSubmit={handleSubmit}>
                <label>Title</label>
                <input placeholder="Enter a title" ref={titleRef} />
                <label>Review</label>
                <textarea
                  placeholder="Say us something about this place."
                  rows="5"
                  cols="25"
                  ref={descRef}
                />
                <label>Rating</label>
                <select ref={ratingRef}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <button type="submit">Add Pin</button>
              </Form>
            </Popup>
          )}
        </div>
      ))}
    </Map>
  );
}

export default Home;