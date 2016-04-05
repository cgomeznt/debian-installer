Modificar una ISO con debian-installer y agregar otro kernel.

Debian-installer
 fuentes
linux-kernel-di-2.6 fuentes
kernel-weged fuentes
scritps (Modificar una imagen .iso existente)

Debo bajar el debian-installer su fuente y realizar las modificaciones como lo es el archivo de pressed, imagenes y el tipo de kernel que utilizara.

Kernel-weged me ayudara a crear los udebs del kernel que indique en debian-installer que utilizara.
Para eso debo  tener los fuentes de linux-kernel-di-2.6 y modificarlo, luego de eso utilizaremos el kernel-weged.
Los udebs generados deben ser copiados en debian-installer-custom/debian-installer-20110106+squeeze4/build/localudebs/

Luego tengo que compilar el debian-installer para que se generen los initrd.gz y los vmlinuz según los udebs requeridos.

Luego utilizo los script para abrir el CD y copiar los initrd.gz y vmlinuz en sus lugares correspondientes y copiar en un directorios los udebs que deben estar dentro de la carpeta pool, luego se ejecuta el otro script y culmina la iso.

Vamos a comenzar....!!!

En el equipo que se realizaron estas pruebas solo se instalo Debian Squeeze 6.0.0-i386 del CD-1 con el kernel 2.6.32-5-686 (Solamente del CD-1)

Con un script de debmirror, se creo un repositorio parcial de Squeeze la rama main, con los tools, docs y udebs. (En el directorio "File" esta el script "mirror-sync")

Preparo la estructura de directorios de trabajo.
# mkdir /mnt/cd
# mkdir /mnt/debian-installer-custom
# mkdir /mnt/linux-kernel-di-2.6
# mkdir -p /mnt/modulos/{iwlwifi,initrd,initrdgtk,tmp}


Preparo mi sources.list	(Si solo si estoy utilizando un repositorio local)
# vi /etc/apt/sources.list
    deb-src http://ftp.debian.org/debian squeeze main contrib non-free
    deb http://ftp.debian.org/debian squeeze contrib non-free
    deb file:/mnt/mirror/debian squeeze main
# apt-get update

Preparo mi equipo local para que tenga el kernel requerido, tal cual, como lo explica en la wiki de debian. 
http://wiki.debian.org/DebianInstaller/Modify/CustomKernel
# apt-get install linux-image-2.6.32-5-686-bigmem

Instalamos algunos componentes requeridos para continuar con el ejercicio
# apt-get install debian-cd kernel-wedge linux-base dpkg-dev

================Configuración e Instalación de debian-installer parte I=======================
# cd /mnt/debian-installer-custom
# apt-get source debian-installer
# cd debian-installer-20110106+squeeze4/
# vi build/config/i386.cfg
En el archivo build/config/i386.cfg verifico que este la version y sabor correcta del kernel
KERNELVERSION = $(BASEVERSION)-486, lo cambio por $(BASEVERSION)-686-bigmem
Verifico las dependencias que faltan para instalarlas
# dpkg-checkbuilddeps	(Este comando me muestra las dependencias pero no las instala)
# apt-get build-dep debian-installer	(Este comando instala las dependencias)

==================Configuración e Instalación de kernel-wedge=========================
# cd /mnt/linux-kernel-di-2.6/
# apt-get source linux-kernel-di-i386-2.6
# dpkg-checkbuilddeps	(Este comando me muestra las dependencias pero no las instala)
# apt-get build-dep linux-kernel-di-i386-2.6	(Este comando instala las dependencias)
# cd linux-kernel-di-i386-2.6-1.99+squeeze7/

Edito el archivo kernel-version para indicarle cual es el kernel que quiero trabajar.
# vi kernel-versions
    # arch   version  flavour       installedname        suffix build-depends
    #i386     2.6.32-5 486           2.6.32-5-486         -      linux-image-2.6.32-5-486
    i386     2.6.32-5 686-bigmem    2.6.32-5-686-bigmem  -      linux-image-2.6.32-5-686-bigmem
Luego ejecuto tal cual como lo dice el README de kernel-wedge /usr/share/doc/kernel-wedge
# kernel-wedge gen-control > debian/control
# kernel-wedge build-all
# cd ..
# ls -l		(Ahí estan los udebs necesarios para el debian-installer)
Luego los udeb que se generan los copio hacia el debian-installer donde esta build/localudebs
# cp *udeb /mnt/debian-installer-custom/debian-installer-20110106+squeeze4/build/localudebs/

================Configuración e Instalación de debian-installer parte II =======================
# cd /mnt/debian-installer-custom/debian-installer-20110106+squeeze4/
Si queremos establecer algunas configuraciones de forma automatica utilizamos preseed.cfg (En el directorio "File" esta el archvivo "preseed.cfg" para squeeze) para esto, editar el archivo de configuración ubicado en installer/build/config/common
# vi build/config/common 
ubicaremos la variable PRESEED y le colocamo la ruta en donde tenemos el archivo preseed.cfg
PRESEED = /home/<usuario>/Files/preseed.cfg
# dpkg-buildpackage
Recuerda que esto creara un directorio build/dest/ que tendra los initrd.gz y los vmlinuz.

========================== Modificar initrd.gz para agregarle firmware =============================
En este ejemplo utilizaremos el firmware de iwlwifi
# cd /mnt/modulos/
# wget http://ftp.us.debian.org/debian/pool/non-free/f/firmware-nonfree/firmware-iwlwifi_0.28+squeeze1_all.deb
# dpkg-deb -x firmware-iwlwifi_0.28+squeeze1_all.deb iwlwifi/
# cd tmp/
# cp /mnt/debian-installer-custom/debian-installer-20110106+squeeze4/build/dest/cdrom/initrd.gz .
# zcat initrd.gz |cpio -iv
# rm initrd.gz
# cp -dpRv ../iwlwifi/lib/firmware/ lib/
# find . -print0 |cpio -0 -H newc -ov |gzip -c > ../initrd/initrd.gz
# rm -rf *
# cp /mnt/debian-installer-custom/debian-installer-20110106+squeeze4/build/dest/cdrom/gtk/initrd.gz .
# zcat initrd.gz |cpio -iv
# rm initrd.gz
# cp -dpRv ../iwlwifi/lib/firmware/ lib/
# find . -print0 |cpio -0 -H newc -ov |gzip -c > ../initrdgtk/initrd.gz
# rm -rf *

============================ Modificar una imagen de un CD de Squeeze ==============================
Debemos tener la imagen de squeeze en formato .iso
Ejecuto el script que me ayuda abrir el iso de debian, recuerda que hay que pasarle los parámetros, origen del .iso, directorio de montaje que es de solo lectura y por ultimo el directorio de trabajo que tiene el control total y en donde haremos las modificaciones. (En el directorio "File" esta el archivo "diunpk")
Para trabajar mas ordenado creemos un directorio de trabajo llamado "cd"
# cd /mnt/cd
# cp /home/<usuario>/Files/di* .
Recuerda que debes tener el iso de debian 
# ./diunpk /home/debian-6.0.0-i386-CD-1.iso mnt d-i
# ls -l
# cd 20120613003750/d-i/install.386/
# ls -l
Recuerda que el instalador en forma de texto es el primer initrd.gz que visualizas y el que esta dentro de gtk es el instalador gráfico.
# rm initrd.gz vmlinuz   
# rm gtk/{initrd.gz,vmlinuz}
# cp /mnt/modulos/initrd/initrd.gz .
# cp /mnt/debian-installer-custom/debian-installer-20110106+squeeze4/build/dest/cdrom/vmlinuz .
# cp /mnt/modulos/initrdgtk/initrd.gz gtk/
# cp /mnt/debian-installer-custom/debian-installer-20110106+squeeze4/build/dest/cdrom/gtk/vmlinuz gtk
Hasta aquí ya tenemos el initrd.gz que es en realidad el debian-installer y el kernel vmlinuz que es el kernel que iniciara el instalador.

============== Agregar los udeb y los deb requeridos en el repositorio del CD =================
Aquí lo que vamos hacer es cargar los udeb que creamos con kernel-wedge y que deben estar en el repositorio del CD, también para agregar el kernel que esta en deb y los otros deb que se requieran.
# cd ../pool/main/
# mkdir udebs
# cp /mnt/debian-installer-custom/debian-installer-20110106+squeeze4/build/localudebs/*udeb udebs/
Ahora me copio los deb, como utilizamos el kernel 2.6.32-5-686-bigmem_2.6.32-45_i386 que se descargo desde la pagina de packages.debian.org los otros deb son dependencia y deben estar incluidos en el repositorio del CD

binutils_2.20.1-16_i386.deb	       libmpfr4_3.0.0-2_i386.deb
cpp-4.3_4.3.5-4_i386.deb	       linux-base_2.6.32-45_all.deb
firmware-linux-free_2.6.32-45_all.deb  linux-headers-2.6.32-5-686-bigmem_2.6.32-45_i386.deb
gcc-4.3_4.3.5-4_i386.deb	       linux-headers-2.6.32-5-common_2.6.32-45_i386.deb
gcc-4.3-base_4.3.5-4_i386.deb	       linux-image-2.6.32-5-686-bigmem_2.6.32-45_i386.deb
libgmp3c2_4.3.2+dfsg-1_i386.deb        linux-kbuild-2.6.32_2.6.32-1_i386.deb
libgomp1_4.4.5-8_i386.deb	       linux-libc-dev_2.6.32-45_i386.deb

# cp /home/<ruta en donde estan los deb>/* .

IMPORTANTE, si queremos que nuestro kernel aparezca en la lista para seleccionar los kernel lo debemos mover dentro de linux-2.6
# mv linux-image-2.6.32-5-686-bigmem_2.6.32-45_i386.deb l/linux-2.6/
# cd ../../..
# ls -l

Ahora con este script vamos a consolidar todos los deb que se agregaron dentro del packages.gz (En el directorio "File" esta el script "diaddpackg")
# ../diaddpackg d-i/

Ahora ejecutamos el script que crea el iso de debian modificado por nosotros, recuerda que hay que pasarle los parametros, destino de nuestro .iso modificado, directorio de montaje que es de solo lectura y por ultimo el directorio de trabajo que tiene el control total y en donde hicimos las modificaciones. (En el directorio "File" esta el archivo "dipk") ya lo debimos haber copiado cuando copiamos el diunpk.
# ../dipk ../debian-custom-i386-CD.iso mnt/ d-i/

====================================Proceso final===================================

Listo.

# cd ..
# ls -l 	(Ahí esta nuestro iso, solo resta probarlo con virtualbox)

cuando lo hagas el boot con virtualbox y selecciones instalar te daras cuenta que se guinda no hace nada, estoy es obvio porque preparamos un debian-installer con un kernel 686 con soporte PAE y el virtualbox seguramente en la configuración de sistema/procesador no tiene tildado la opción de soporte PAE, cuando se la actives veras que funciona.


====================================Documentos Utilizados====================================
http://lihuen.linti.unlp.edu.ar/index.php?title=Modificando_debian-installer
http://wiki.debian.org/DebianInstaller/Modify/CustomKernel
/usr/share/doc/kernel-wedge
http://wiki.debian.org/DebianInstaller/Modify/CD
http://people.connexer.com/~roberto/howtos/debrepository
https://help.ubuntu.com/community/InstallCDCustomization#Modify%20pool%20structure%20to%20include%20more%20packages

En este Directorio se encuentra las paginas por si no están online
