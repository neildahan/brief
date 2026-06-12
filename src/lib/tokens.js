// Design tokens — department accents + icon registry.
// Components resolve a department's `accent` / `icon` string through here, so the
// roster stays pure data in src/services/dataverse.js.

import { createElement } from 'react'
import {
  Buildings,
  Scales,
  Bank,
  Cpu,
  Receipt,
  Handshake,
  Users,
  Gavel,
  FileText,
  MagnifyingGlass,
  UsersThree,
  Key,
  Crane,
  Calculator,
  Scroll,
  Signature,
  Lightbulb,
  Briefcase,
  Percent,
  GlobeHemisphereWest,
  Robot,
} from '@phosphor-icons/react'

// Feature icons render in Phosphor's "duotone" weight by default — a richer,
// branded two-tone look (vs. flat single-stroke). Change ICON_WEIGHT to
// 'bold' | 'regular' | 'fill' | 'thin' to re-style every feature icon at once.
const ICON_WEIGHT = 'duotone'

// Wrap a Phosphor icon so callers can keep using <Icon size= className= />.
// (createElement avoids JSX so this file stays a plain .js module.)
const wrap = (PhosphorIcon) =>
  function Icon(props) {
    return createElement(PhosphorIcon, { weight: ICON_WEIGHT, ...props })
  }

// Icon registry — maps the string keys used in the data to Phosphor components.
// Unknown keys fall back to Robot.
const RAW = {
  building2: Buildings,
  scale: Scales,
  landmark: Bank,
  cpu: Cpu,
  receipt: Receipt,
  handshake: Handshake,
  users: Users,
  gavel: Gavel,
  fileText: FileText,
  search: MagnifyingGlass,
  usersRound: UsersThree,
  keyRound: Key,
  buildingCrane: Crane,
  calculator: Calculator,
  scrollText: Scroll,
  fileSignature: Signature,
  lightbulb: Lightbulb,
  briefcase: Briefcase,
  percent: Percent,
  globe: GlobeHemisphereWest,
}

export const ICONS = Object.fromEntries(
  Object.entries(RAW).map(([key, Ph]) => [key, wrap(Ph)]),
)

const FALLBACK = wrap(Robot)

export function iconFor(key) {
  return ICONS[key] || FALLBACK
}

// Accent palette — Tailwind class bundles per accent key. Kept as full class
// strings (not interpolated) so Tailwind's scanner keeps them.
export const ACCENTS = {
  indigo: {
    text: 'text-indigo-600',
    bg: 'bg-indigo-50',
    bgSolid: 'bg-indigo-600',
    border: 'border-indigo-200',
    ring: 'ring-indigo-500',
    dot: 'bg-indigo-500',
    hover: 'hover:bg-indigo-50',
  },
  rose: {
    text: 'text-rose-600',
    bg: 'bg-rose-50',
    bgSolid: 'bg-rose-600',
    border: 'border-rose-200',
    ring: 'ring-rose-500',
    dot: 'bg-rose-500',
    hover: 'hover:bg-rose-50',
  },
  amber: {
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    bgSolid: 'bg-amber-600',
    border: 'border-amber-200',
    ring: 'ring-amber-500',
    dot: 'bg-amber-500',
    hover: 'hover:bg-amber-50',
  },
  emerald: {
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    bgSolid: 'bg-emerald-600',
    border: 'border-emerald-200',
    ring: 'ring-emerald-500',
    dot: 'bg-emerald-500',
    hover: 'hover:bg-emerald-50',
  },
  sky: {
    text: 'text-sky-600',
    bg: 'bg-sky-50',
    bgSolid: 'bg-sky-600',
    border: 'border-sky-200',
    ring: 'ring-sky-500',
    dot: 'bg-sky-500',
    hover: 'hover:bg-sky-50',
  },
}

export function accentFor(key) {
  return ACCENTS[key] || ACCENTS.indigo
}
