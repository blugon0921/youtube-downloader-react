import { useState } from "react"
import { styled } from 'styled-components'
import HistoryItem from "./HistoryItem"
import ReactModal from "react-modal"
import Modal from "./Modal"

const App = styled.div`
  width: 100%;
  height: 110%;
  background-color: #1F1F1F;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const Version = styled.span`
  position: fixed;
  right: 5px;
  bottom: 5px;
  font-weight: 600;
  font-size: 2.5vh;
`

const Icon = styled.img`
  margin-top: 9vh;
  width: 40vw;
`
const Title = styled.h1`
  margin: 0;
  font-size: 5vw;
  font-weight: 600;
`

const Center = styled.div`
  width: 72vw;
  height: 10vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 7vh;
`
const UrlInput = styled.input`
  width: 60vw;
  height: 100%;
  border-radius: 3.6vw;
  font-size: 3vw;
  font-weight: 700;
  text-indent: 2.25vw;
  padding: 0.5vw;
  color: #C9D2C9;
  background-color: #454545;
  border: solid 0.25vh #5D635A;
  box-shadow: 0 0 20px #393d38;

  &.wrong::placeholder {
    color: #AD4545;
  }
`
const Download = styled.button`
  width: 10vw;
  height: 100%;
  border-radius: 3.6vw;
  font-size: 3vw;
  padding: 0.5vw;
  color: #C9D2C9;
  background-color: #454545;
  border: solid 0.25vh #5D635A;
  box-shadow: 0 0 20px #393d38;
`
const DownloadIcon = styled.img`
  width: 65%;
  height: 65%;
`

const History = styled.div`
  width: 72vw;
  height: 40vh;
  margin-top: 6vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4vh;
  border: solid 0.25vh #5D635A;
  background-color: #303030;
  box-shadow: 0 0 20px #393d38;

  border-bottom: none;
  border-radius: 3.6vw 3.6vw 0 0; //Left&Right: 0
`

const modalStyle = {
  overlay: {
    backgroundColor: " rgba(0, 0, 0, 0.3)",
    width: "100vw",
    height: "100vh",
    zIndex: "1",
    position: "fixed",
    top: "0",
    left: "0",
  },
  content: {
    width: "90%",
    height: "90%",
    zIndex: "2",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "10px",
    boxShadow: "0 0 20px #393d38",
    backgroundColor: "#1f1f1f",
    border: "solid 0.25vh #5D635A",
    justifyContent: "center",
    overflow: "auto",
  },
}

const AlertBtnsDiv = styled.div`
  display: flex;
  height: 50%;
  align-items: center;
  justify-content: space-evenly;
`
const AlertBtn = styled.button`
  position: relative;
  width: 25%;
  height: 50%;
  border-radius: 1vh;
  font-size: 3vw;
  padding: 0.5vw;
  color: #C9D2C9;
  background-color: #454545;
  border: solid 0.25vh #5D635A;
  box-shadow: 0 0 20px #393d38;
  margin-top: 1vh;
  font-weight: 700;
`

export default function() {
  const [url, setUrl] = useState("")
  const [isOpenModal, setIsOpenModal] = useState(false)
  // const [isOpenModal, setIsOpenModal] = useState(true)
  const [historyItems, setHistoryItems] = useState([
    // {
    //   url: "https://www.youtube.com/watch?v=FRkZi3ZXrVc",
    //   type: "video",
    //   downloadId: 0
    // }
  ])

  const [inputClass, setInputClass] = useState("")
  const [placeholder, setPlaceholder] = useState("유튜브 영상 링크를 입력하세요.")

  const [isOpenAlertModal, setIsOpenAlertModal] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  return (
    <App id="App">
      <Version>v1.0.9</Version>
      <Icon src="icons/cloud-arrow-down-solid.svg"></Icon>
      <Title>Youtube Downloader</Title>
      <Center>
        <UrlInput type="text" value={url} onChange={(e) => {setUrl(e.target.value)}} placeholder={placeholder} className={inputClass}/>
        <Download onClick={() => { //Download
          if(url.match(/(http:|https:)?(\/\/)?(www\.)?(youtube.com|youtu.be)\/(watch|embed)?(\?v=|\/)?(\S+)?/g)) {
            setIsOpenModal(true)
          } else {
            setUrl("")
            setPlaceholder("유튜브 영상이 아닙니다.")
            setInputClass("wrong")
            setTimeout(() => {
              setPlaceholder("유튜브 영상 링크를 입력하세요.")
              setInputClass("")
            }, 1000)
          }
        }}><DownloadIcon src="icons/download-solid.svg"></DownloadIcon></Download>
      </Center>
      <History>
        {
          historyItems.map((item) => {
            return <HistoryItem
              url={item.url}
              type={item.type}
              downloadId={item.downloadId}
              key={item.downloadId}
              path={item.path}
              setIsOpenAlertModal={setIsOpenAlertModal}
              setAlertMessage={setAlertMessage}
            />
          })
        }
      </History>
      <ReactModal
        isOpen={isOpenModal}
        style={modalStyle}
        ariaHideApp={false}
      >
        <Modal
          url={url}
          setUrl={setUrl}
          setModal={setIsOpenModal}
          historyItems={historyItems}
          setHistoryItems={setHistoryItems}
          setIsOpenAlertModal={setIsOpenAlertModal}
          setAlertMessage={setAlertMessage}
        >
        </Modal>
      </ReactModal>

      <ReactModal
          isOpen={isOpenAlertModal}
          style={{
            overlay: {
              backgroundColor: " rgba(0, 0, 0, 0.3)",
              width: "100vw",
              height: "100vh",
              zIndex: "1",
              position: "fixed",
              top: "0",
              left: "0",
            },
            content: {
              width: "55%",
              height: "25%",
              zIndex: "2",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "10px",
              boxShadow: "0 0 20px #393d38",
              backgroundColor: "#1f1f1f",
              border: "solid 0.25vh #5D635A",
              justifyContent: "center",
              overflow: "auto",
            },
          }}
          ariaHideApp={false}
      >
        <h3>{alertMessage}</h3>
        <AlertBtnsDiv>
          <AlertBtn onClick={() => setIsOpenAlertModal(false)}>확인</AlertBtn>
        </AlertBtnsDiv>
      </ReactModal>
    </App>
  )
}