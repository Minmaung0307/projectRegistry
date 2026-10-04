import React from 'react';
import {Rocket, Gem, Compass, Orbit, Sparkles, Flame, Leaf, Hexagon, Cuboid, Zap, Globe2, Heart, Aperture, Feather, Sun, Puzzle} from 'lucide-react';
const icons=[Rocket,Gem,Compass,Orbit,Sparkles,Flame,Leaf,Hexagon,Cuboid,Zap,Globe2,Heart,Aperture,Feather,Sun,Puzzle];
function hash(value){return [...value].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);}
// Assign against the full collection, so search and filters never reshuffle identities.
export function projectIdentities(projects){const usedIcons=new Set(),usedColors=new Set();const result={};for(const p of [...projects].sort((a,b)=>a.id.localeCompare(b.id))){const h=hash(p.id);let icon=h%icons.length,color=(h>>>8)%6;while(usedIcons.size<icons.length&&usedIcons.has(icon))icon=(icon+1)%icons.length;while(usedColors.size<6&&usedColors.has(color))color=(color+1)%6;usedIcons.add(icon);usedColors.add(color);result[p.id]={icon,color};}return result;}
export function ProjectSymbol({identity,className}){const Icon=icons[identity?.icon??0];return <Icon className={className} aria-hidden="true" strokeWidth={1.8}/>;}
