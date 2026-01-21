import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Card>
      <CardHeader title="Application not found" subtitle="It may have been deleted or you may not have access to it." />
      <CardContent>
        <Link href="/app/applications">
          <Button variant="secondary">Back to applications</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

