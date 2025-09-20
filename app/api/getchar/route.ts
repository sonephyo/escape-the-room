// app/api/getchar/route.ts
import { NextResponse } from 'next/server';

const SAMPLE_AGENTS = [
  {
    id: '68ce3c0bbffb79a13037e183',
    name: 'Aristotle',
    description:
      'Ancient Greek philosopher whose works in ethics, logic, and metaphysics shaped Western philosophy.',
    puzzle:
      'I swing between skyscrapers with a spider’s grace; my mask hides a nerdy face. Who am I?',
    solution: 'spider-man',
    building: 'Goldwin Smith Hall',
    color: '#ffffff',
    speed: 5
  },
  {
    id: '68ce3c8fbffb79a13037e188',
    name: 'Gottfried Wilhelm Leibniz',
    description:
      'German polymath, philosopher, and mathematician who sought a universal system of knowledge.',
    puzzle:
      'By night I fight crime from the shadows; by day I’m a billionaire with gadgets galore. Who am I?',
    solution: 'batman',
    building: 'Olin Library',
    color: '#ffffff',
    speed: 5
  }
];

export async function POST() {
  // Mimic your real endpoint shape — your client already POSTs here.
  return NextResponse.json(SAMPLE_AGENTS, { status: 200 });
}
