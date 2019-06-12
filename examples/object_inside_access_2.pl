obj := object
        begin
          a := 1;
          c := 2;
          procedure b();
          begin
            print(this.a + this.c);
          end
        end
        ;

  
call obj.b();