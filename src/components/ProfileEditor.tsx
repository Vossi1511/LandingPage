import { useState, useEffect } from 'react';
import { Camera, Save, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { getProfile, updateProfile, type ProfileData } from '../lib/auth';
import { Badge } from './ui/badge';

export function ProfileEditor() {
  const [profile, setProfile] = useState<ProfileData>(getProfile());
  const [newAlternateName, setNewAlternateName] = useState('');
  const [newHobby, setNewHobby] = useState({ label: '', icon: 'Star', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' });
  const [newSocialLink, setNewSocialLink] = useState({ 
    label: '', 
    href: '', 
    icon: 'Mail', 
    color: 'hover:bg-blue-500/20 hover:border-blue-500/40 hover:text-blue-300' 
  });
  const [previewImage, setPreviewImage] = useState<string>(profile.profileImage);

  useEffect(() => {
    setPreviewImage(profile.profileImage);
  }, [profile.profileImage]);

  const handleSave = () => {
    updateProfile(profile);
    toast.success('Profile updated successfully');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfile({ ...profile, profileImage: result });
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addAlternateName = () => {
    if (newAlternateName.trim()) {
      setProfile({
        ...profile,
        alternateNames: [...profile.alternateNames, newAlternateName.trim()],
      });
      setNewAlternateName('');
    }
  };

  const removeAlternateName = (index: number) => {
    setProfile({
      ...profile,
      alternateNames: profile.alternateNames.filter((_, i) => i !== index),
    });
  };

  const addHobby = () => {
    if (newHobby.label.trim()) {
      setProfile({
        ...profile,
        hobbies: [...profile.hobbies, newHobby],
      });
      setNewHobby({ label: '', icon: 'Star', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' });
    }
  };

  const removeHobby = (index: number) => {
    setProfile({
      ...profile,
      hobbies: profile.hobbies.filter((_, i) => i !== index),
    });
  };

  const addSocialLink = () => {
    if (newSocialLink.label.trim() && newSocialLink.href.trim()) {
      setProfile({
        ...profile,
        socialLinks: [...profile.socialLinks, newSocialLink],
      });
      setNewSocialLink({ 
        label: '', 
        href: '', 
        icon: 'Mail', 
        color: 'hover:bg-blue-500/20 hover:border-blue-500/40 hover:text-blue-300' 
      });
    }
  };

  const removeSocialLink = (index: number) => {
    setProfile({
      ...profile,
      socialLinks: profile.socialLinks.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Profile Picture
          </CardTitle>
          <CardDescription className="text-slate-400">
            Upload or change your profile picture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden flex items-center justify-center">
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-12 h-12 text-slate-600" />
              )}
            </div>
            <div className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="bg-slate-800 border-slate-600 text-slate-100"
              />
              <p className="text-sm text-slate-400">
                Recommended: Square image, at least 256x256px
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Basic Information</CardTitle>
          <CardDescription className="text-slate-400">
            Your display name and bio information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-200">
              Display Name
            </Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="bg-slate-800 border-slate-600 text-slate-100"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Alternate Names</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.alternateNames.map((name, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-slate-800 text-slate-200 border-slate-600"
                >
                  {name}
                  <button
                    onClick={() => removeAlternateName(index)}
                    className="ml-2 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newAlternateName}
                onChange={(e) => setNewAlternateName(e.target.value)}
                placeholder="Add alternate name"
                className="bg-slate-800 border-slate-600 text-slate-100"
                onKeyDown={(e) => e.key === 'Enter' && addAlternateName()}
              />
              <Button
                onClick={addAlternateName}
                variant="outline"
                className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quote */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Quote</CardTitle>
          <CardDescription className="text-slate-400">
            Your favorite quote or motto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quote-text" className="text-slate-200">
              Quote Text
            </Label>
            <Textarea
              id="quote-text"
              value={profile.quote.text}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  quote: { ...profile.quote, text: e.target.value },
                })
              }
              className="bg-slate-800 border-slate-600 text-slate-100"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quote-author" className="text-slate-200">
              Author
            </Label>
            <Input
              id="quote-author"
              value={profile.quote.author}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  quote: { ...profile.quote, author: e.target.value },
                })
              }
              className="bg-slate-800 border-slate-600 text-slate-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hobbies */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Hobbies & Interests</CardTitle>
          <CardDescription className="text-slate-400">
            Manage your hobbies and interests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {profile.hobbies.map((hobby, index) => (
              <Badge
                key={index}
                variant="outline"
                className={hobby.color}
              >
                {hobby.label}
                <button
                  onClick={() => removeHobby(index)}
                  className="ml-2 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newHobby.label}
              onChange={(e) => setNewHobby({ ...newHobby, label: e.target.value })}
              placeholder="Add hobby"
              className="bg-slate-800 border-slate-600 text-slate-100"
              onKeyDown={(e) => e.key === 'Enter' && addHobby()}
            />
            <Button
              onClick={addHobby}
              variant="outline"
              className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Connection Methods
          </CardTitle>
          <CardDescription className="text-slate-400">
            Add, edit, or remove your social media and contact links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {profile.socialLinks.map((link, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Label className="text-slate-200">{link.label}</Label>
                  <Input
                    value={link.href}
                    onChange={(e) => {
                      const newLinks = [...profile.socialLinks];
                      newLinks[index].href = e.target.value;
                      setProfile({ ...profile, socialLinks: newLinks });
                    }}
                    className="bg-slate-800 border-slate-600 text-slate-100"
                  />
                </div>
                <Button
                  onClick={() => removeSocialLink(index)}
                  variant="outline"
                  className="bg-red-900/20 border-red-500/40 text-red-300 hover:bg-red-900/40"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-700 pt-4 mt-4">
            <Label className="text-slate-200 mb-2 block">Add New Connection</Label>
            <div className="flex gap-2">
              <Input
                value={newSocialLink.label}
                onChange={(e) => setNewSocialLink({ ...newSocialLink, label: e.target.value })}
                placeholder="Label (e.g., Instagram)"
                className="bg-slate-800 border-slate-600 text-slate-100 flex-1"
                onKeyDown={(e) => e.key === 'Enter' && addSocialLink()}
              />
              <Input
                value={newSocialLink.href}
                onChange={(e) => setNewSocialLink({ ...newSocialLink, href: e.target.value })}
                placeholder="URL (e.g., https://...)"
                className="bg-slate-800 border-slate-600 text-slate-100 flex-1"
                onKeyDown={(e) => e.key === 'Enter' && addSocialLink()}
              />
              <Button
                onClick={addSocialLink}
                variant="outline"
                className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}