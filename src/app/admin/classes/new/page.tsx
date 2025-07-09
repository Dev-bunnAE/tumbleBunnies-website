'use client';

import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';
import { AdminHeader } from '@/components/admin/admin-header';
import { db } from '@/lib/firebase';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CircularProgress from '@mui/material/CircularProgress';
import Slider from '@mui/material/Slider';
import { addDoc, collection } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Cropper from 'react-easy-crop';

const TYPE_OPTIONS = ['Gymnastics', 'Art', 'Music', 'Dance', 'Coding', 'Cooking'];
const SKILL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const AGE_RANGE_OPTIONS = [
  'Any',
  '0-1',
  '2-3',
  '4-5',
  '6-7',
  '8-10',
];

function getCroppedImg(imageSrc: string, crop: any, zoom: any, aspect: any) {
  // Helper to crop the image in the browser
  // We'll use a canvas to crop and resize to 400x400
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context is null'));
      const scale = image.width / image.naturalWidth;
      const cropX = crop.x * scale;
      const cropY = crop.y * scale;
      ctx.drawImage(
        image,
        cropX,
        cropY,
        crop.width * scale,
        crop.height * scale,
        0,
        0,
        400,
        400
      );
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 0.95);
    };
    image.onerror = error => reject(error);
  });
}

export default function AddClass() {
  const [form, setForm] = useState({
    name: '',
    ageRange: AGE_RANGE_OPTIONS[0],
    imageUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropping, setCropping] = useState(false);
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) {
    setError('');
    let file;
    if ('dataTransfer' in e && e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      file = e.dataTransfer.files[0];
    } else if ('target' in e && e.target && (e.target as HTMLInputElement).files && (e.target as HTMLInputElement).files!.length > 0) {
      file = (e.target as HTMLInputElement).files![0];
    }
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only JPEG and PNG images are allowed.');
      return;
    }
          if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result as string);
      setCropping(true);
    });
    reader.readAsDataURL(file);
  }

  function onCropComplete(_: any, croppedAreaPixels: any) {
    setCroppedAreaPixels(croppedAreaPixels);
  }

  async function handleCropAndUpload() {
    if (!imageSrc || !croppedAreaPixels) return;
    setUploading(true);
    setError('');
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, zoom, 1);
      const storage = getStorage();
      const storageRef = ref(storage, `class-images/${Date.now()}.jpg`);
      await uploadBytes(storageRef, croppedBlob as Blob);
      const url = await getDownloadURL(storageRef);
      setForm(f => ({ ...f, imageUrl: url }));
      setCropping(false);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.imageUrl) {
      setError('Please upload and crop a class image.');
      return;
    }
    setSaving(true);
    // Only send the correct fields to Firestore
    const { name, ageRange, imageUrl } = form;
    await addDoc(collection(db, 'classes'), { name, ageRange, imageUrl });
    setSaving(false);
    router.push('/admin/classes');
  }

  return (
    <AdminAuthGuard>
      <div>
        <AdminHeader />
        <main className="container mx-auto px-4 py-12 max-w-xl">
          <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">Add Class</h1>
          <form className="bg-card rounded-lg shadow-md p-6 space-y-4" onSubmit={handleSubmit}>
            <input className="w-full p-2 border rounded" name="name" placeholder="Class Name" value={form.name} onChange={handleChange} required />
            <select className="w-full p-2 border rounded" name="ageRange" value={form.ageRange} onChange={handleChange} required>
              <option value="" disabled>Select Age Range</option>
              {AGE_RANGE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt === 'Any' ? 'Any' : `${opt} years`}</option>
              ))}
            </select>

            <div className="flex flex-col gap-2">
              <span className="font-semibold">Class Image</span>
              <div className="flex gap-4 items-center">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  ref={inputFileRef}
                  onChange={onSelectFile}
                  className="hidden"
                />
                <button
                  type="button"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold"
                  onClick={() => inputFileRef.current?.click()}
                >
                  <PhotoCamera className="inline mr-2" /> Upload Image
                </button>
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="Class" className="h-16 w-16 object-cover rounded" />
                )}
              </div>
              {error && <p className="text-destructive text-sm mt-2">{error}</p>}
              {cropping && (
                <div className="relative w-full h-64 bg-muted rounded mt-4">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center">
                    <Slider
                      min={1}
                      max={3}
                      step={0.01}
                      value={zoom}
                      onChange={(_, v) => setZoom(v as number)}
                      className="w-1/2"
                    />
                    <button
                      type="button"
                      className="mt-2 bg-primary text-primary-foreground px-4 py-2 rounded font-semibold"
                      onClick={handleCropAndUpload}
                      disabled={uploading}
                    >
                      {uploading ? <CircularProgress size={20} /> : 'Crop & Upload'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold w-full disabled:opacity-50"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Class'}
            </button>
          </form>
          <div className="text-center mt-4">
            <Link href="/admin/classes" className="text-primary hover:underline">Back to Classes</Link>
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
} 