import { useEffect, useState } from "react"
import { styled } from 'styled-components'
import { youtubeID } from "../module"
const fs = window.require("fs")
const ytdl = window.require("ytdl-core")
const { ipcRenderer } = window.require("electron")

const HistoryItem = styled.div`
  width: 100%;
  height: 13vh;
  border-radius: 3.6vw;
  background-color: #222322;
  display: flex;
  align-items: center;
  flex-direction: row;
  padding: 2.75vw;
  margin-bottom: 2.5vh;
  transition: 0.2s;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    transform: scale(1.025);
    filter: brightness(1.25);
    box-shadow: #464646 0 0 10px;
  }
`
const Icon = styled.img`
  height: 100%;
`
const Thumbnail = styled.img`
  height: 100%;
  border-radius: 2vh;
  margin: 1vh;
`
const Info = styled.div`
  width: 42vw;
  margin-left: 2vw;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
`
const ChannelName = styled.span`
  width: 100%;
  font-size: 2vw;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`
const VideoTitle = styled.h5`
  width: 100%;
  font-size: 2.5vw;
  margin: 3px 3px 3px 0; //Left: 0
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`
const Status = styled.span`
  font-size: 2.25vw;
  font-weight: 600;
  color: #ada245;
  white-space: pre-line;

  &.complete {
    color: #45ad5a;
  }
  &.faild {
    color: #ad4545;
  }
`

export default function(props) {
  const url = props.url
  const id = youtubeID(url)
  // const thumbnail = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`

  const [type, setType] = useState(props.type)
  const [channelName, setChannelName] = useState("검색중...")
  const [videoTitle, setVideoTitle] = useState("검색중...")
  const downloadId = props.downloadId
  const path = props.path

  useEffect(() => {
    ytdl.getInfo(url).then(video => {
      const info = video.videoDetails
      const author = info.author
      setChannelName(author.name)
      setVideoTitle(info.title)
    }).catch((e) => {
      setStatus("faild")
      setStatusText("영상을 찾을 수 없습니다")
    })

    ipcRenderer.on(`SetStatus${downloadId}`, (event, args) => {
      const message = args[0]
      const isComplete = args[1]
      if(message) {
        setStatusText(message)
      } else {
        if(isComplete) {
          setStatus("complete")
          setStatusText("다운로드 완료")
        } else {
          setStatus("faild")
          setStatusText("다운로드 실패")
        }
      }
    })
  }, [])

  const [status, setStatus] = useState("downloading")
  const [statusText, setStatusText] = useState("다운로드중...")

  const setIsOpenAlertModal = props.setIsOpenAlertModal
  const setAlertMessage = props.setAlertMessage

  return (
    <HistoryItem onClick={() => {
      if(!fs.existsSync(path)) {
        setAlertMessage("파일이 변형되었거나 존재하지 않습니다.")
        return setIsOpenAlertModal(true)
      }
      ipcRenderer.send("OpenFile", [path])
    }}>
      {/* <Thumbnail src={thumbnail} /> */}
      <Icon src={`icons/file-${type}-solid.svg`} alt={type}></Icon>
      <Info>
        <ChannelName>{channelName}</ChannelName>
        <VideoTitle>{videoTitle}</VideoTitle>
        <Status className={status}>{statusText}</Status>
      </Info>
    </HistoryItem>
  )
}