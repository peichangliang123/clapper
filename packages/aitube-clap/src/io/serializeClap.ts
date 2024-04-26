import YAML from "yaml"
import { v4 as uuidv4 } from "uuid"

import { getValidNumber } from "@/utils/getValidNumber"

import { ClapHeader, ClapMeta, ClapModel, ClapProject, ClapScene, ClapSegment } from "../types"

export async function serializeClap({
  meta, // ClapMeta
  models, // ClapModel[]
  scenes, // ClapScene[]
  segments, // ClapSegment[]
}: ClapProject): Promise<Blob> {
  
  // we play it safe, and we verify the structure of the parameters,
  // to make sure we generate a valid clap file
  const clapModels: ClapModel[] = models.map(({
    id,
    category,
    triggerName,
    label,
    description,
    author,
    thumbnailUrl,
    seed,
    imagePrompt,
    imageSourceType,
    imageEngine,
    imageId,
    audioPrompt,
    audioSourceType,
    audioEngine,
    audioId,
    age,
    gender,
    region,
    appearance,
  }) => ({
    id,
    category,
    triggerName,
    label,
    description,
    author,
    thumbnailUrl,
    seed,
    imagePrompt,
    imageSourceType,
    imageEngine,
    imageId,
    audioPrompt,
    audioSourceType,
    audioEngine,
    audioId,
    age,
    gender,
    region,
    appearance,
  }))

  const clapScenes: ClapScene[] = scenes.map(({
    id,
    scene,
    line,
    rawLine,
    sequenceFullText,
    sequenceStartAtLine,
    sequenceEndAtLine,
    startAtLine,
    endAtLine,
    events,
  }) => ({
    id,
    scene,
    line,
    rawLine,
    sequenceFullText,
    sequenceStartAtLine,
    sequenceEndAtLine,
    startAtLine,
    endAtLine,
    events: events.map(e => e)
  }))

  const clapSegments: ClapSegment[] = segments.map(({
    id,
    track,
    startTimeInMs,
    endTimeInMs,
    category,
    modelId,
    sceneId,
    prompt,
    label,
    outputType,
    renderId,
    status,
    assetUrl,
    assetDurationInMs,
    createdBy,
    editedBy,
    outputGain,
    seed,
  }) => ({
    id,
    track,
    startTimeInMs,
    endTimeInMs,
    category,
    modelId,
    sceneId,
    prompt,
    label,
    outputType,
    renderId,
    status,
    assetUrl,
    assetDurationInMs,
    createdBy,
    editedBy,
    outputGain,
    seed,
  }))

  const clapHeader: ClapHeader = {
    format: "clap-0",
    numberOfModels: clapModels.length,
    numberOfScenes: clapScenes.length,
    numberOfSegments: clapSegments.length,
  }

  const clapMeta: ClapMeta = {
    id: meta.id || uuidv4(),
    title: typeof meta.title === "string" ? meta.title : "Untitled",
    description: typeof meta.description === "string" ? meta.description : "",
    synopsis: typeof meta.synopsis === "string" ? meta.synopsis : "",
    licence: typeof meta.licence === "string" ? meta.licence : "",
    orientation: meta.orientation === "portrait" ? "portrait" : meta.orientation === "square" ? "square" : "landscape",
    durationInMs: getValidNumber(meta.durationInMs, 1000, Number.MAX_SAFE_INTEGER, 4000),
    width: getValidNumber(meta.width, 256, 8192, 1024),
    height: getValidNumber(meta.height, 256, 8192, 576),
    defaultVideoModel:  typeof meta.defaultVideoModel === "string" ? meta.defaultVideoModel : "SVD",
    extraPositivePrompt: Array.isArray(meta.extraPositivePrompt) ? meta.extraPositivePrompt : [],
    screenplay: typeof meta.screenplay === "string" ? meta.screenplay : "",
    isLoop: typeof meta.screenplay === "boolean" ? meta.screenplay : false,
    isInteractive: typeof meta.isInteractive === "boolean" ? meta.isInteractive : false,
  }

  const entries = [
    clapHeader,
    clapMeta,
    ...clapModels,
    ...clapScenes,
    ...clapSegments
  ]

  const strigifiedResult = YAML.stringify(entries)

  // Convert the string to a Blob
  const blobResult = new Blob([strigifiedResult], { type: "application/x-yaml" })

   // Create a stream for the blob
   const readableStream = blobResult.stream()

   // Compress the stream using gzip
   const compressionStream = new CompressionStream('gzip')
   const compressedStream = readableStream.pipeThrough(compressionStream)

   // Create a new blob from the compressed stream
   const response = new Response(compressedStream)
   
   response.headers.set("Content-Type", "application/x-gzip")

   const compressedBlob = await response.blob()

  return compressedBlob
}