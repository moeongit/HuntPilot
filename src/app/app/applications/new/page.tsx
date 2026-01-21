import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobApplicationForm } from "@/components/app/job-application-form";

export default function NewApplicationPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader
          title="New application"
          subtitle="Add an application with status, priority, tags, and key dates."
          right={
            <Link href="/app/applications">
              <Button variant="secondary" size="sm">
                Back
              </Button>
            </Link>
          }
        />
        <CardContent>
          <JobApplicationForm />
        </CardContent>
      </Card>
    </div>
  );
}

