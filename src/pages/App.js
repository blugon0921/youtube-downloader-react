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
  border: solid #5D635A;
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
  border: solid #5D635A;
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
  border-radius: 3.6vw;
  padding: 4vh;
  border: solid 2px #5D635A;
  background-color: #303030;
  box-shadow: 0 0 20px #393d38;

  border-bottom: none;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
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
    border: "solid 2px #5D635A",
    justifyContent: "center",
    overflow: "auto",
  },
}


export default function() {
  const [url, setUrl] = useState("")
  const [isOpenModal, setIsOpenModal] = useState(false)
  // const [isOpenModal, setIsOpenModal] = useState(true)
  const [historyItems, setHistoryItems] = useState([
  ])

  const [inputClass, setInputClass] = useState("")
  const [placeholder, setPlaceholder] = useState("유튜브 영상 링크를 입력하세요.")


  return (
    <App id="App">
      <Version>v1.0.6</Version>
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
          // historyItems.reverse().map((item) => {
          historyItems.map((item) => {
            return <HistoryItem
              url={item.url}
              type={item.type}
              downloadId={item.downloadId}
              key={item.downloadId}
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
        >
        </Modal>
      </ReactModal>
    </App>
  )
}