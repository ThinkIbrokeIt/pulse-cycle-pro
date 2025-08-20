import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Lock, 
  Users, 
  Shield, 
  Info,
  Calendar,
  Coins
} from 'lucide-react';

interface LockTemplate {
  id: string;
  name: string;
  description: string;
  template_type: string;
  default_duration_days: number;
  min_duration_days: number;
  max_duration_days: number;
  is_multisig_required: boolean;
  security_score: number;
  features: any;
}

interface CreateLockDialogProps {
  children: React.ReactNode;
}

export default function CreateLockDialog({ children }: CreateLockDialogProps) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<LockTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LockTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    tokenAddress: '',
    tokenSymbol: '',
    lockAmount: '',
    lockDurationDays: '',
    beneficiaryAddress: '',
    isMultisig: false,
    requiredSignatures: 1,
    lockType: 'liquidity'
  });

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('lock_templates')
        .select('*')
        .eq('is_active', true)
        .order('security_score', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to fetch lock templates');
    }
  };

  const handleTemplateSelect = (template: LockTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      lockDurationDays: template.default_duration_days.toString(),
      isMultisig: template.is_multisig_required,
      lockType: template.template_type
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Calculate unlock date
      const unlockDate = new Date();
      unlockDate.setDate(unlockDate.getDate() + parseInt(formData.lockDurationDays));

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('Please log in to create a lock contract');
        return;
      }

      // Create lock contract
      const { data, error } = await supabase
        .from('lock_contracts')
        .insert({
          user_id: user.user.id,
          contract_address: `0x${Math.random().toString(16).substring(2, 42)}`, // Mock address
          contract_type: formData.lockType,
          token_address: formData.tokenAddress,
          token_symbol: formData.tokenSymbol,
          lock_amount: parseFloat(formData.lockAmount),
          lock_duration_days: parseInt(formData.lockDurationDays),
          unlock_date: unlockDate.toISOString(),
          beneficiary_address: formData.beneficiaryAddress,
          is_multisig: formData.isMultisig,
          required_signatures: formData.requiredSignatures,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Lock contract created successfully!');
      setOpen(false);
      
      // Reset form
      setFormData({
        tokenAddress: '',
        tokenSymbol: '',
        lockAmount: '',
        lockDurationDays: '',
        beneficiaryAddress: '',
        isMultisig: false,
        requiredSignatures: 1,
        lockType: 'liquidity'
      });
      setSelectedTemplate(null);

    } catch (error) {
      console.error('Error creating lock contract:', error);
      toast.error('Failed to create lock contract');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Create Trustless Lock Contract
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Choose Lock Template</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {templates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      {template.name}
                      <Badge variant={template.is_multisig_required ? 'default' : 'secondary'}>
                        {template.security_score}/100
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {template.default_duration_days} days
                      </span>
                      {template.is_multisig_required && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Multi-sig
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold">Lock Details</h3>
            
            {/* Token Information */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="tokenAddress">Token Contract Address</Label>
                <Input
                  id="tokenAddress"
                  placeholder="0x..."
                  value={formData.tokenAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, tokenAddress: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tokenSymbol">Token Symbol</Label>
                <Input
                  id="tokenSymbol"
                  placeholder="e.g., PULSE"
                  value={formData.tokenSymbol}
                  onChange={(e) => setFormData(prev => ({ ...prev, tokenSymbol: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="lockAmount">Lock Amount</Label>
                <Input
                  id="lockAmount"
                  type="number"
                  placeholder="Amount to lock"
                  value={formData.lockAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, lockAmount: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Lock Configuration */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="lockDurationDays">Lock Duration (Days)</Label>
                <Input
                  id="lockDurationDays"
                  type="number"
                  placeholder="365"
                  value={formData.lockDurationDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, lockDurationDays: e.target.value }))}
                  min={selectedTemplate?.min_duration_days || 1}
                  max={selectedTemplate?.max_duration_days || 3650}
                  required
                />
                {selectedTemplate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Range: {selectedTemplate.min_duration_days} - {selectedTemplate.max_duration_days} days
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="beneficiaryAddress">Beneficiary Address</Label>
                <Input
                  id="beneficiaryAddress"
                  placeholder="0x... (who can unlock)"
                  value={formData.beneficiaryAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryAddress: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="lockType">Lock Type</Label>
                <Select value={formData.lockType} onValueChange={(value) => setFormData(prev => ({ ...prev, lockType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="liquidity">Liquidity Lock</SelectItem>
                    <SelectItem value="team_tokens">Team Tokens</SelectItem>
                    <SelectItem value="marketing">Marketing Tokens</SelectItem>
                    <SelectItem value="development">Development Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Multi-sig Configuration */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isMultisig"
                  checked={formData.isMultisig}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isMultisig: !!checked }))}
                />
                <Label htmlFor="isMultisig">Enable Multi-signature</Label>
              </div>

              {formData.isMultisig && (
                <div>
                  <Label htmlFor="requiredSignatures">Required Signatures</Label>
                  <Input
                    id="requiredSignatures"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.requiredSignatures}
                    onChange={(e) => setFormData(prev => ({ ...prev, requiredSignatures: parseInt(e.target.value) }))}
                  />
                </div>
              )}
            </div>

            {/* Security Info */}
            {selectedTemplate && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Security Features</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    {selectedTemplate.features.emergency_unlock && (
                      <div>✓ Emergency unlock with community vote</div>
                    )}
                    {selectedTemplate.features.extendable && (
                      <div>✓ Lock duration can be extended</div>
                    )}
                    {selectedTemplate.features.partial_unlock && (
                      <div>✓ Partial unlocking supported</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button type="submit" disabled={isLoading || !selectedTemplate} className="w-full">
              {isLoading ? 'Creating Lock...' : 'Create Lock Contract'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}