import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Update = () => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-muted-foreground">
        Stay updated with new quizzes and exams
      </h3>
      <div className="flex flex-row gap-4">
        <Input
          type="email"
          placeholder="Enter your email"
          className="bg-zinc-700 text-muted-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <Button className="bg-[#FF8D28] text-white hover:bg-[#FF8D28]/90 transition">
          Subscribe
        </Button>
      </div>
    </div>
  );
};

export default Update;