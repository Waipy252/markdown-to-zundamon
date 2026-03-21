import React, { useState, useEffect, useRef } from "react";
import {
  AbsoluteFill,
  Html5Audio,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useDelayRender,
} from "remotion";
import {
  loadFont as loadMPLUSRounded1c,
  fontFamily as mPLUSRounded1cFamily,
} from "@remotion/google-fonts/MPLUSRounded1c";
import { CompositionPropsSchema } from "./types";
import { CharacterDisplay } from "./components/CharacterDisplay";
import { ChapterTitle } from "./components/ChapterTitle";
import { Subtitle } from "./components/Subtitle";
import { SlideContent } from "./components/SlideContent";

// Static font registry: add entries here when new fonts are needed.
const STATIC_FONTS: Record<
  string,
  { load: () => ReturnType<typeof loadMPLUSRounded1c>; fontFamily: string }
> = {
  "M PLUS Rounded 1c": {
    load: loadMPLUSRounded1c,
    fontFamily: mPLUSRounded1cFamily,
  },
};

/**
 * Load Google Fonts via useDelayRender and return resolved CSS font-family names.
 * Uses static per-font imports to avoid webpack dynamic chunk splitting issues.
 */
function useGoogleFonts(fontNames: string[]): Map<string, string> {
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [resolvedFonts, setResolvedFonts] = useState<Map<string, string>>(
    () => new Map()
  );
  const handleRef = useRef<ReturnType<typeof delayRender> | null>(null);

  // Deduplicate and sort for stable dependency
  const key = [...new Set(fontNames)].sort().join(",");

  useEffect(() => {
    const uniqueNames = [...new Set(fontNames)];
    if (uniqueNames.length === 0) return;

    const handle = delayRender(`Loading fonts: ${uniqueNames.join(", ")}`);
    handleRef.current = handle;

    Promise.all(
      uniqueNames.map(async (name) => {
        const entry = STATIC_FONTS[name];
        if (!entry) {
          console.warn(`Font "${name}" not in static registry, using as-is`);
          return [name, name] as const;
        }
        await entry.load().waitUntilDone();
        return [name, entry.fontFamily] as const;
      })
    )
      .then((entries) => {
        setResolvedFonts(new Map(entries));
        continueRender(handle);
      })
      .catch((err) => {
        cancelRender(err);
      });
  }, [key]);

  return resolvedFonts;
}

export const ZundamonComposition: React.FC<Record<string, unknown>> = (props) => {
  const compositionProps = CompositionPropsSchema.parse(props);
  const { manifest } = compositionProps;
  if (!manifest) {
    throw new Error("manifest is not loaded yet");
  }
  const frame = useCurrentFrame();
  const { segments, config } = manifest;

  // Collect all font names to load
  const fontNames = [config.fontFamily];
  if (config.subtitleFontFamily) fontNames.push(config.subtitleFontFamily);
  if (config.slideFontFamily) fontNames.push(config.slideFontFamily);

  const resolvedFonts = useGoogleFonts(fontNames);

  const resolveFontFamily = (name: string) =>
    resolvedFonts.get(name) ?? name;

  const baseFontFamily = resolveFontFamily(config.fontFamily);
  const subtitleFontFamily = resolveFontFamily(
    config.subtitleFontFamily ?? config.fontFamily
  );
  const slideFontFamily = resolveFontFamily(
    config.slideFontFamily ?? config.fontFamily
  );

  // Jingle duration in frames
  const jingleDurationInFrames = config.jingle
    ? Math.ceil((config.jingle.durationMs / 1000) * config.fps)
    : 0;

  // End jingle starts after all content
  const endJingleStartFrame = config.jingle
    ? manifest.totalDurationInFrames - jingleDurationInFrames
    : 0;

  // Build timeline: compute start frame for each segment (offset by jingle)
  const timeline: { segment: (typeof segments)[number]; startFrame: number }[] =
    [];
  let currentFrame = jingleDurationInFrames;
  for (const segment of segments) {
    timeline.push({ segment, startFrame: currentFrame });
    currentFrame += segment.durationInFrames;
  }

  // Check if currently in a jingle segment (inline or opening/ending)
  const isInEndJingle =
    config.jingle != null &&
    frame >= endJingleStartFrame &&
    frame < endJingleStartFrame + jingleDurationInFrames;
  const isInJingle = isInEndJingle || timeline.some(
    (entry) =>
      entry.segment.type === "jingle" &&
      frame >= entry.startFrame &&
      frame < entry.startFrame + entry.segment.durationInFrames
  );

  // Find current slide: last slide segment whose startFrame <= current frame
  let currentSlideMarkdown: string | null = null;
  for (const entry of timeline) {
    if (entry.segment.type === "slide" && entry.startFrame <= frame) {
      currentSlideMarkdown = entry.segment.markdown ?? entry.segment.text;
    }
  }

  // Find current chapter: last chapter segment whose startFrame <= current frame
  let currentChapterTitle: string | null = null;
  for (const entry of timeline) {
    if (entry.segment.type === "chapter" && entry.startFrame <= frame) {
      currentChapterTitle = entry.segment.text;
    }
  }

  // Find current speech segment for subtitle and active character
  let currentSpeechText: string | null = null;
  let currentSpeechCharacter: string | null = null;
  let currentSpeechStyle: string | null = null;
  for (const entry of timeline) {
    if (
      entry.segment.type === "speech" &&
      frame >= entry.startFrame &&
      frame < entry.startFrame + entry.segment.durationInFrames
    ) {
      currentSpeechText = entry.segment.text;
      currentSpeechCharacter = entry.segment.character ?? null;
      currentSpeechStyle = entry.segment.style ?? null;
    }
  }

  // Resolve current speaker's color
  const currentCharConfig = currentSpeechCharacter
    ? config.characters.find((c) => c.name === currentSpeechCharacter)
    : undefined;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: config.backgroundImage ? undefined : "#e8f5e9",
        fontFamily: `'${baseFontFamily}', sans-serif`,
      }}
    >
      {config.backgroundImage && (
        <Img
          src={staticFile(config.backgroundImage)}
          style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      {/* Jingle */}
      {jingleDurationInFrames > 0 && (
        <Sequence from={0} durationInFrames={jingleDurationInFrames}>
          <AbsoluteFill>
            <Img
              src={staticFile(config.jingle!.imagePath)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <AbsoluteFill
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: `'${baseFontFamily}', sans-serif`,
                  fontSize: 72,
                  fontWeight: "bold",
                  color: "#ffffff",
                  textShadow: "0 0 8px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.6)",
                  letterSpacing: "0.05em",
                }}
              >
                {config.jingle!.text}
              </div>
            </AbsoluteFill>
            <Html5Audio src={staticFile(config.jingle!.audioPath)} />
          </AbsoluteFill>
        </Sequence>
      )}

      {/* End Jingle */}
      {jingleDurationInFrames > 0 && (
        <Sequence from={endJingleStartFrame} durationInFrames={jingleDurationInFrames}>
          <AbsoluteFill>
            <Img
              src={staticFile(config.jingle!.imagePath)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <AbsoluteFill
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: `'${baseFontFamily}', sans-serif`,
                  fontSize: 72,
                  fontWeight: "bold",
                  color: "#ffffff",
                  textShadow: "0 0 8px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.6)",
                  letterSpacing: "0.05em",
                }}
              >
                {config.jingle!.text}
              </div>
            </AbsoluteFill>
            <Html5Audio src={staticFile(config.jingle!.audioPath)} />
          </AbsoluteFill>
        </Sequence>
      )}

      {/* BGM: scene-based (takes priority) or global fallback */}
      {manifest.bgmSegments && manifest.bgmSegments.length > 0
        ? manifest.bgmSegments.map((bgmSeg, i) => {
          const baseVolume = config.bgm?.volume ?? 0.1;
          const fadeInMs = config.bgm?.fadeInMs ?? 0;
          const fadeOutMs = config.bgm?.fadeOutMs ?? 1000;
          const duration = bgmSeg.endFrame - bgmSeg.startFrame;
          return (
            <Sequence key={`bgm-${i}`} from={bgmSeg.startFrame} durationInFrames={duration}>
              <Html5Audio
                src={staticFile(bgmSeg.file)}
                volume={(f) => {
                  const fps = config.fps;
                  const fadeInFrames = Math.ceil((fadeInMs / 1000) * fps);
                  const fadeOutFrames = Math.ceil((fadeOutMs / 1000) * fps);
                  let vol = baseVolume;
                  if (fadeInFrames > 0) {
                    vol *= interpolate(f, [0, fadeInFrames], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    });
                  }
                  if (fadeOutFrames > 0) {
                    vol *= interpolate(f, [duration - fadeOutFrames, duration], [1, 0], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    });
                  }
                  return vol;
                }}
                loop
              />
            </Sequence>
          );
        })
        : manifest.bgmFile && config.bgm && (
          <Sequence from={jingleDurationInFrames} durationInFrames={manifest.totalDurationInFrames - jingleDurationInFrames}>
            <Html5Audio
              src={staticFile(manifest.bgmFile)}
              volume={(f) => {
                const fps = config.fps;
                const total = manifest.totalDurationInFrames;
                const fadeInFrames = Math.ceil((config.bgm!.fadeInMs / 1000) * fps);
                const fadeOutFrames = Math.ceil((config.bgm!.fadeOutMs / 1000) * fps);
                const baseVolume = config.bgm!.volume;

                let vol = baseVolume;
                if (fadeInFrames > 0) {
                  vol *= interpolate(f, [0, fadeInFrames], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
                }
                if (fadeOutFrames > 0) {
                  vol *= interpolate(
                    f,
                    [total - fadeOutFrames, total],
                    [1, 0],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  );
                }
                return vol;
              }}
              loop
            />
          </Sequence>
        )}

      {/* Sound effects */}
      {manifest.soundEffects?.map((se, i) => (
        <Sequence key={`se-${i}`} from={se.startFrame} durationInFrames={manifest.totalDurationInFrames - se.startFrame}>
          <Html5Audio src={staticFile(se.file)} />
        </Sequence>
      ))}

      {/* Audio sequences (speech + jingle) */}
      {timeline.map(
        (entry, i) =>
          (entry.segment.type === "speech" || entry.segment.type === "jingle") &&
          entry.segment.audioFile && (
            <Sequence
              key={i}
              from={entry.startFrame}
              durationInFrames={entry.segment.durationInFrames}
            >
              <Html5Audio src={staticFile(entry.segment.audioFile)} volume={entry.segment.type === "speech" ? 2.5 : 1} />
            </Sequence>
          )
      )}

      {/* Jingle visual overlay */}
      {timeline.map(
        (entry, i) => {
          if (entry.segment.type !== "jingle") return null;
          const jingleImage = entry.segment.imagePath ?? config.jingle?.imagePath;
          return (
            <Sequence
              key={`jingle-${i}`}
              from={entry.startFrame}
              durationInFrames={entry.segment.durationInFrames}
            >
              <AbsoluteFill
                style={{
                  backgroundColor: "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {jingleImage ? (
                  <Img
                    src={staticFile(jingleImage)}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : null}
                {(entry.segment.text || config.jingle?.text) ? (
                  <AbsoluteFill
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingTop: "10%",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: `'${baseFontFamily}', sans-serif`,
                        fontSize: 72,
                        fontWeight: "bold",
                        color: "#ffffff",
                        textShadow: "0 0 8px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.6)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {entry.segment.text || config.jingle?.text}
                    </div>
                  </AbsoluteFill>
                ) : null}
              </AbsoluteFill>
            </Sequence>
          );
        }
      )}

      {/* Slide content */}
      {!isInJingle && currentSlideMarkdown && (
        <SlideContent
          markdown={currentSlideMarkdown}
          fontFamily={slideFontFamily}
          codeHighlightTheme={config.codeHighlightTheme}
        />
      )}

      {/* Chapter title */}
      {!isInJingle && currentChapterTitle && (
        <ChapterTitle
          title={currentChapterTitle}
          fontFamily={baseFontFamily}
          position={config.chapterTitlePosition}
        />
      )}

      {/* Characters */}
      {!isInJingle && config.characters.map((char) => (
        <CharacterDisplay
          key={char.name}
          isSpeaking={currentSpeechCharacter === char.name}
          imageSrc={`characters/${char.name}/default.png`}
          activeImageSrcs={(() => {
            const map = char.activeImages;
            if (!map) return undefined;
            const isSpeaking = currentSpeechCharacter === char.name;
            const style = isSpeaking ? currentSpeechStyle : null;
            const files = (style && map[style]) ? map[style] : map["default"] ?? [];
            return files.map((img) => `characters/${char.name}/${img}`);
          })()}
          style={currentSpeechCharacter === char.name ? currentSpeechStyle ?? undefined : undefined}
          characterName={char.name}
          position={char.position}
          flip={char.flip}
          overflowBottom={char.overflowY}
          overflowSide={char.overflowX}
          height={char.height}
        />
      ))}

      {/* Subtitle */}
      {!isInJingle && currentSpeechText && (
        <Subtitle
          text={currentSpeechText}
          fontFamily={subtitleFontFamily}
          strokeColor={currentCharConfig?.color}
        />
      )}
    </AbsoluteFill>
  );
};
