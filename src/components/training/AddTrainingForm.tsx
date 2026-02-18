import { useState } from "react";
import { motion } from "framer-motion";
import { X, MapPin, Calendar, Users, Building, FileText, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAddTraining, useTrainingThemes, useInstitutions } from "@/hooks/useTrainings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

interface AddTrainingFormProps {
  onClose: () => void;
}

export default function AddTrainingForm({ onClose }: AddTrainingFormProps) {
  const { user } = useAuth();
  const addTraining = useAddTraining();
  const { data: themes = [] } = useTrainingThemes();
  const { data: institutions = [] } = useInstitutions();

  const [form, setForm] = useState({
    title: "",
    theme: "",
    organizer: "",
    institution_id: "",
    location_name: "",
    lat: "",
    lng: "",
    state: "",
    level: "State",
    start_date: "",
    end_date: "",
    participants_total: "",
    participants_male: "",
    participants_female: "",
    trainer_names: "",
    outcome_summary: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await addTraining.mutateAsync({
      title: form.title,
      theme: form.theme,
      organizer: form.organizer,
      institution_id: form.institution_id || null,
      location_name: form.location_name,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      state: form.state,
      level: form.level,
      start_date: form.start_date,
      end_date: form.end_date,
      participants_total: parseInt(form.participants_total) || 0,
      participants_male: parseInt(form.participants_male) || 0,
      participants_female: parseInt(form.participants_female) || 0,
      trainer_names: form.trainer_names || null,
      outcome_summary: form.outcome_summary || null,
      created_by: user.id,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 glass-strong z-10">
          <div>
            <h2 className="font-display font-bold text-foreground">Add Training Event</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Record a new disaster management training</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Basic Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-display font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Basic Information
            </h3>
            <Input
              placeholder="Training Title *"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              required
              className="bg-muted border-border"
            />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.theme} onValueChange={v => set("theme", v)} required>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Disaster Theme *" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map(t => (
                    <SelectItem key={t.id} value={t.theme_name}>{t.theme_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={form.level} onValueChange={v => set("level", v)}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Training Level" />
                </SelectTrigger>
                <SelectContent>
                  {["National", "State", "District", "Community"].map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Organizer / Institution *"
                value={form.organizer}
                onChange={e => set("organizer", e.target.value)}
                required
                className="bg-muted border-border"
              />
              <Select value={form.institution_id} onValueChange={v => set("institution_id", v)}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Link Institution" />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map(i => (
                    <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <h3 className="text-xs font-display font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> Location
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="City / District *"
                value={form.location_name}
                onChange={e => set("location_name", e.target.value)}
                required
                className="bg-muted border-border"
              />
              <Select value={form.state} onValueChange={v => set("state", v)} required>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="State *" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Latitude (optional)"
                value={form.lat}
                onChange={e => set("lat", e.target.value)}
                type="number"
                step="any"
                className="bg-muted border-border"
              />
              <Input
                placeholder="Longitude (optional)"
                value={form.lng}
                onChange={e => set("lng", e.target.value)}
                type="number"
                step="any"
                className="bg-muted border-border"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-3">
            <h3 className="text-xs font-display font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Schedule
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Start Date *</label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={e => set("start_date", e.target.value)}
                  required
                  className="bg-muted border-border"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">End Date *</label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={e => set("end_date", e.target.value)}
                  required
                  className="bg-muted border-border"
                />
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-3">
            <h3 className="text-xs font-display font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Participants
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="Total *"
                value={form.participants_total}
                onChange={e => set("participants_total", e.target.value)}
                type="number"
                min="0"
                required
                className="bg-muted border-border"
              />
              <Input
                placeholder="Male"
                value={form.participants_male}
                onChange={e => set("participants_male", e.target.value)}
                type="number"
                min="0"
                className="bg-muted border-border"
              />
              <Input
                placeholder="Female"
                value={form.participants_female}
                onChange={e => set("participants_female", e.target.value)}
                type="number"
                min="0"
                className="bg-muted border-border"
              />
            </div>
            <Input
              placeholder="Trainer Names (comma separated)"
              value={form.trainer_names}
              onChange={e => set("trainer_names", e.target.value)}
              className="bg-muted border-border"
            />
          </div>

          {/* Outcome */}
          <Textarea
            placeholder="Outcome Summary — key highlights, learnings, impact..."
            value={form.outcome_summary}
            onChange={e => set("outcome_summary", e.target.value)}
            className="bg-muted border-border min-h-[80px]"
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addTraining.isPending}
              className="flex-1 bg-gradient-primary text-primary-foreground"
            >
              {addTraining.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
              ) : "Save Training"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
