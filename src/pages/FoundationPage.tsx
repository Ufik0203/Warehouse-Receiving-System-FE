import { useState } from 'react';
import { Button } from '@heroui/react/button';
import { Card } from '@heroui/react/card';

export function FoundationPage() {
  const [presses, setPresses] = useState(0);

  return <main className="min-h-screen bg-background px-6 py-12 text-foreground sm:py-20">
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted">Task 2A · Fondasi UI</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Warehouse Receiving System</h1>
        <p className="text-muted">Halaman contoh untuk memeriksa styling dan interaksi komponen. Fitur bisnis belum tersedia.</p>
      </header>

      <Card>
        <Card.Header>
          <Card.Title>Pratinjau komponen</Card.Title>
          <Card.Description>HeroUI v3 dengan utility Tailwind CSS v4.</Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <div className="rounded-xl bg-emerald-100 p-4 text-sm font-medium text-emerald-950">
            Blok utility: warna, padding, dan sudut membulat dari Tailwind.
          </div>
          <p role="status" aria-live="polite" className="text-sm text-muted">Tombol dicoba {presses} kali.</p>
        </Card.Content>
        <Card.Footer className="flex flex-wrap gap-3">
          <Button variant="primary" onPress={() => setPresses(value => value + 1)}>Coba tombol</Button>
          <Button variant="secondary" isDisabled>Contoh nonaktif</Button>
        </Card.Footer>
      </Card>
    </div>
  </main>;
}
