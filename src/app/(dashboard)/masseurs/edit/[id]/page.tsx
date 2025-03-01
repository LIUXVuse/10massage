import { MasseurEditClient } from "./client";

export default function EditMasseurPage({ params }: { params: { id: string } }) {
  return <MasseurEditClient id={params.id} />;
} 