import { z } from "zod";

// Zod schemas
export const CharacterSchema = z.object({
  name: z.string(),
  speakerId: z.number(),
  position: z.enum(["left", "right"]).default("right"),
  flip: z.boolean().default(false),
  color: z.string().default("#555555"),
  overflowY: z.number().default(0.4),
  overflowX: z.number().default(0.1),
  height: z.number().default(800),
  speed: z.number().positive().optional(),
  styles: z.record(z.string(), z.number()).optional(),
  // image path は name から自動解決: characters/<name>/default.png
  activeImages: z.array(z.string()).optional(),
});

export const BgmConfigSchema = z.object({
  src: z.string(),
  volume: z.number().min(0).max(1).default(0.1),
  fadeInMs: z.number().min(0).default(0),
  fadeOutMs: z.number().min(0).default(1000),
});

export const JingleConfigSchema = z.object({
  durationMs: z.number().default(3000),
  imagePath: z.string().default(""),
  text: z.string().default(""),
  audioPath: z.string().default(""),
});

export const ManifestConfigSchema = z.object({
  fps: z.number().default(30),
  width: z.number().default(1920),
  height: z.number().default(1080),
  speakerId: z.number().default(3),
  characters: z.array(CharacterSchema).min(1),
  slideTransitionMs: z.number().default(600),
  speechGapMs: z.number().default(200),
  paragraphGapMs: z.number().default(400),
  fontFamily: z.string().default("M PLUS Rounded 1c"),
  subtitleFontFamily: z.string().optional(),
  slideFontFamily: z.string().optional(),
  codeHighlightTheme: z.string().default("oneLight"),
  bgm: BgmConfigSchema.optional(),
  jingle: JingleConfigSchema.optional(),
  chapterTitlePosition: z
    .enum(["top-right", "top-left"])
    .default("top-right"),
  readingsDictionary: z.record(z.string(), z.string()).optional(),
  speed: z.number().positive().default(1.0),
});

export const SegmentSchema = z.object({
  type: z.enum(["speech", "slide", "pause", "chapter", "jingle"]),
  text: z.string(),
  audioFile: z.string().optional(),
  durationInFrames: z.number(),
  markdown: z.string().optional(),
  character: z.string().optional(),
  chapterLevel: z.number().optional(),
  imagePath: z.string().optional(),
  style: z.string().optional(),
});

export const SceneBgmSchema = z.object({
  file: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
});

export const SoundEffectSchema = z.object({
  file: z.string(),
  startFrame: z.number(),
});

export const ManifestSchema = z.object({
  config: ManifestConfigSchema,
  totalDurationInFrames: z.number(),
  segments: z.array(SegmentSchema),
  bgmFile: z.string().optional(),
  bgmSegments: z.array(SceneBgmSchema).optional(),
  soundEffects: z.array(SoundEffectSchema).optional(),
});

export const CompositionPropsSchema = z.object({
  projectName: z.string(),
  manifest: ManifestSchema.optional(),
});

// Types derived from schemas
export type Character = z.infer<typeof CharacterSchema>;
export type ManifestConfig = z.infer<typeof ManifestConfigSchema>;
export type Segment = z.infer<typeof SegmentSchema>;
export type SegmentType = Segment["type"];
export type SceneBgm = z.infer<typeof SceneBgmSchema>;
export type SoundEffect = z.infer<typeof SoundEffectSchema>;
export type Manifest = z.infer<typeof ManifestSchema>;
export type CompositionPropsType = z.infer<typeof CompositionPropsSchema>;
