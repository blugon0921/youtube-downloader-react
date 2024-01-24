import { useEffect, useState } from "react"
import { styled } from 'styled-components'
import { youtubeID } from "../module"
import Select, { StylesConfig } from "react-select"
import { getDownloadId, setDownloadId } from "../index"
import ReactModal from "react-modal";
// import ytdl from "ytdl-core"
const ytdl = window.require("ytdl-core")
const { ipcRenderer } = window.require("electron")
const Path = window.require("path")
const desktopDir = Path.join(window.require("os").homedir(), "Desktop")
const defaultDownloadPath = window.require("downloads-folder")()
const fs = window.require("fs")

const Modal = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;
`

const EndLine = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`
const Close = styled.button`
  width: 7vw;
  height: 7vw;
  border-radius: 2vw;
  font-size: 3vw;
  padding: 0.5vw;
  color: #C9D2C9;
  background-color: #454545;
  border: solid 0.25vh #5D635A;
  box-shadow: 0 0 20px #393d38;
  display: flex;
  align-items: center;
  justify-content: center;
`
const XMark = styled.img`
  width: 80%;
  height: 80%;
`

const Top = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1vh;
`
const VideoBackground = styled.div`
  width: 73vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #1A1A1A;
  padding: 3vh 0;
  border-radius: 3vh;
  margin: 2vh;
`
const Thumbnail = styled.img`
  width: 60vw;
  border-radius: 2vh;
`
const Info = styled.div`
  width: 60vw;
  margin-top: 1vh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  text-align: left;
`
const ChannelName = styled.span`
  font-size: 2vw;
`
const VideoTitle = styled.h5`
  font-size: 2.5vw;
  margin: 3px 3px 3px 0;
  text-align: left;
`

const TypeDiv = styled.div`
  width: 100%;
  margin-top: 2vh;
  text-align: center;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
`
const selectStyle = {
  container: (styles) => ({
    ...styles,
    width: "40%",
  }),
  control: (styles) => ({
    ...styles,
    backgroundColor: "#454545",
    border: "solid 0.25vh #5D635A",
    boxShadow: "0 0 20px #393d38",
    width: "100%",
    borderRadius: "1vh",
  }),
  singleValue: (styles) => ({
    ...styles,
    color: "#C9D2C9",
    fontWeight: 600,
    fontSize: "3vw"
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: "#454545",
    border: "solid 0.25vh #5D635A",
    borderRadius: "1vh",
    boxShadow: "0 0 20px #393d38",
    width: "100%",
  }),
  option: (styles, { data, isDisabled, isSelected }) => {
    return {
      ...styles,
      color: "#C9D2C9",
      fontWeight: 600,
      fontSize: "3vw",
      backgroundColor: isSelected? `#5D635A` : `#454545`,
      ":active": {
        backgroundColor: isSelected? `#5D635A` : `#474D45`,
      }
    }
  },
}

const PathDiv = styled.div`
  margin-top: 2vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
`
const PathInput = styled.input`
  width: 72%;
  height: 5vh;
  border-radius: 1vh;
  font-size: 3vw;
  font-weight: 700;
  text-indent: 1.5vw;
  padding: 0.5vw;
  color: #C9D2C9;
  background-color: #454545;
  border: solid 0.25vh #5D635A;
  box-shadow: 0 0 20px #393d38;

  &:disabled {
    background-color: #1f1f1f;
  }
`
const SelectPath = styled.button`
  width: 5vh;
  height: 5vh;
  border-radius: 1vh;
  font-size: 3vw;
  padding: 0.5vw;
  color: #C9D2C9;
  background-color: #454545;
  border: solid 0.25vh #5D635A;
  box-shadow: 0 0 20px #393d38;
`
const SelectPathImg = styled.img`
  width: 70%;
  height: 70%;
`

const Bottom = styled.div`
  width: 94%;
  height: 17.5%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
`
const Message = styled.span`
  font-weight: 600;
  font-size: 3vw;
  opacity: 0;
  color: #E35858;
`
const DownloadBtn = styled.button`
  position: relative;
  width: 10vh;
  height: 5vh;
  border-radius: 1vh;
  font-size: 3vw;
  padding: 0.5vw;
  color: #C9D2C9;
  background-color: #454545;
  border: solid 0.25vh #5D635A;
  box-shadow: 0 0 20px #393d38;
  margin-top: 1vh;
`
const DownloadImg = styled.img`
  width: 70%;
  height: 70%;
`

const existModalStyle = {
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
}
const ExistText = styled.span`
  font-size: 2.5vw;
`
const ExistBtnsDiv = styled.div`
  display: flex;
  height: 50%;
  align-items: center;
  justify-content: space-evenly;
`
const ExistBtn = styled.button`
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
  
  &.noVideo {
    
  }
`

export default function(props) {
  const url = props.url
  // const url = "https://www.youtube.com/watch?v=c4Fw8oRP-e8"
  const id = youtubeID(url)
  const thumbnail = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
  
  const [channelName, setChannelName] = useState("검색중...")
  const [videoTitle, setVideoTitle] = useState("검색중...")

  const [isOpenNoVideoModal, setIsOpenNoVideoModal] = useState(false)
  useEffect(() => {
    ytdl.getInfo(url).then(video => {
      const info = video.videoDetails
      const author = info.author
      setChannelName(author.name)
      setVideoTitle(info.title)
      const beforePath = window.localStorage.getItem("lastPath")
      if(!beforePath) setPath(Path.join(defaultDownloadPath, `${info.title}.${mime.value}`))
      else setPath(Path.join(beforePath, `${info.title}.${mime.value}`))
      setPathDisabled(false)
    }).catch((e) => {
      setIsOpenNoVideoModal(true)
      props.setUrl("")
    })
  }, [])

  const typeOptions = [
    { value: "video", label: "동영상" },
    { value: "audio", label: "오디오" },
  ]
  const [type, setType] = useState(typeOptions[0])

  const videoMimeOptions = [
    { value: "mp4", label: "MP4" },
    { value: "mkv", label: "MKV" },
    { value: "avi", label: "AVI" },
    { value: "wmv", label: "WMV" },
  ]
  const audioMimeOptions = [
    { value: "mp3", label: "MP3" },
    { value: "ogg", label: "OGG" },
    { value: "wav", label: "WAV" },
    { value: "m4a", label: "M4A" },
  ]
  const [mime, setMime] = useState(videoMimeOptions[0])
  
  // const [path, setPath] = useState(Path.join(desktopDir, `media.${mime.value}`))
  const [path, setPath] = useState("로딩중...")
  const [pathDisabled, setPathDisabled] = useState(true)

  function changeType(t) {
    if(type.value === t.value) return
    setType(t)
    changeMime((t.value === "video")? videoMimeOptions[0] : audioMimeOptions[0])
  }
  function changeMime(m) {
    setMime(m)
    let filePath = Path.dirname(path)
    let fileName = path.split("/").at(-1).split("\\").at(-1).split(".")
    fileName.pop()
    fileName = fileName.join(".")
    // const fileMime = path.split("/").at(-1).split("\\").at(-1).split(".").at(-1)
    setPath(Path.join(filePath, `${fileName}.${m.value}`))
  }

  function addPathSelectedEvent() {
    ipcRenderer.once("SelectPath", (event, args) => {
      if(args[0] === undefined) return
      setPath(args[0])
    })
  }
  const [messageOpacity, setMessageOpacity] = useState(0)
  const [messageTransition, setMessageTransition] = useState(0)

  const [isOpenExistModal, setIsOpenExistModal] = useState(false)
  // const [isOpenExistModal, setIsOpenExistModal] = useState(true)


  function downloadStart() {
    setIsOpenExistModal(false)
    if(!fs.existsSync(Path.dirname(path))) {
      setMessageOpacity(1)
      setTimeout(() => {
        setMessageTransition(0.2)
      }, 2000)
      setTimeout(() => {
        setMessageOpacity(0)
      }, 2010)
      setTimeout(() => {
        setMessageTransition(0)
      }, 2210)
      return
    }
    window.localStorage.setItem("lastPath", Path.dirname(path))
    ipcRenderer.send("Download", [url, id, type.value, mime.value, path, getDownloadId()])
    props.setModal(false)
    props.setUrl("")
    let items = props.historyItems
    items.unshift({
      url: url,
      type: type.value,
      downloadId: getDownloadId()
    })
    props.setHistoryItems(items)
    setDownloadId(getDownloadId()+1)
  }

  return (
    <Modal>
      <EndLine><Close onClick={() => {
        props.setModal(false)
        props.setUrl("")
      }}><XMark src="icons/xmark-solid.svg"></XMark></Close></EndLine>
      <Top>
        <VideoBackground>
          <Thumbnail src={thumbnail} alt="Thumbnail.png"></Thumbnail>
          <Info>
            <ChannelName>{channelName}</ChannelName>
            <VideoTitle>{videoTitle}</VideoTitle>
          </Info>
        </VideoBackground>
      </Top>
      <TypeDiv>
        <Select
          options={typeOptions} 
          onChange={changeType}
          styles={selectStyle}
          value={type}
          id="type"
        />
        <Select
          options={(type.value === "video")? videoMimeOptions : audioMimeOptions}
          onChange={changeMime}
          styles={selectStyle}
          value={mime}
          id="mime"
        />
      </TypeDiv>
      <PathDiv>
        <PathInput value={path} onChange={(e) => {setPath(e.target.value)}} disabled={pathDisabled} />
        <SelectPath onClick={(e) => {
          ipcRenderer.send("SelectPath", { type: type.value, mime: mime.value })
          addPathSelectedEvent()
        }}><SelectPathImg src="icons/folder-solid.svg" /></SelectPath>
      </PathDiv>
      <Bottom>
        <Message style={{
          opacity: messageOpacity,
          transition: `${messageTransition}s`
        }}>경로가 존재하지 않습니다.</Message>
        <DownloadBtn onClick={() => {
          if(fs.existsSync(path)) return setIsOpenExistModal(true)
          else if(!path.toLowerCase().endsWith(mime.value) && fs.existsSync(`${path}.${mime.value}`)) return setIsOpenExistModal(true)
          downloadStart()
        }}><DownloadImg src="icons/download-solid.svg" /></DownloadBtn>
      </Bottom>
      <ReactModal
        isOpen={isOpenExistModal}
        style={existModalStyle}
        ariaHideApp={false}
      >
        <ExistText>{`
        ${(!path.toLowerCase().endsWith(mime.value))? `${path}.${mime.value}` : path}
         파일이 이미 존재합니다.`}</ExistText>
        <br/>
        <br/>
        <ExistText>덮어씌우시겠습니까?</ExistText>
        <ExistBtnsDiv>
          <ExistBtn onClick={() => {setIsOpenExistModal(false)}}>취소</ExistBtn>
          <ExistBtn onClick={downloadStart}>계속</ExistBtn>
        </ExistBtnsDiv>
      </ReactModal>
      <ReactModal
          isOpen={isOpenNoVideoModal}
          style={existModalStyle}
          ariaHideApp={false}
      >
        <h3>동영상이 비공개거나 존재하지 않습니다</h3>
        <ExistBtnsDiv>
          <ExistBtn className={"noVideo"} onClick={() => props.setModal(false)}>확인</ExistBtn>
        </ExistBtnsDiv>
      </ReactModal>
    </Modal>
  )
}