/**********************************************************************
 * Copyright (c) 2020 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/
import 'reflect-metadata';
import 'reflect-metadata';

import * as fs from 'fs-extra';
import * as path from 'path';

import { Build } from './build';
import { Container } from 'inversify';
import { extensionsModule } from './extensions/extension-module';
import { featuredModule } from './featured/featured-module';
import { metaYamlModule } from './meta-yaml/meta-yaml-module';
import { pluginModule } from './plugin/plugin-module';
import { recommendationsModule } from './recommendations/recommendations-module';
import { sidecarModule } from './sidecar/plugin-module';

export class InversifyBinding {
  private container: Container;

  public async initBindings(): Promise<Container> {
    let outputDirectory = '/tmp/che-plugin-registry/output-folder';
    const downloadDirectory = '/tmp/che-plugin-registry/download-folder';
    const unpackedDirectory = '/tmp/che-plugin-registry/unpack-folder';

    const pluginRegistryRootDirectory = path.resolve(__dirname, '..', '..', '..');

    const args = process.argv.slice(2);
    args.forEach(arg => {
      if (arg.startsWith('--output-folder:')) {
        outputDirectory = arg.substring('--output-folder:'.length);
      }
    });
    this.container = new Container();
    this.container.load(extensionsModule);
    this.container.load(featuredModule);
    this.container.load(pluginModule);
    this.container.load(metaYamlModule);
    this.container.load(recommendationsModule);
    this.container.load(sidecarModule);

    this.container.bind(Build).toSelf().inSingletonScope();

    this.container.bind('string[]').toConstantValue(args).whenTargetNamed('ARGUMENTS');

    this.container.bind('string').toConstantValue(unpackedDirectory).whenTargetNamed('UNPACKED_ROOT_DIRECTORY');
    this.container.bind('string').toConstantValue(downloadDirectory).whenTargetNamed('DOWNLOAD_ROOT_DIRECTORY');
    this.container
      .bind('string')
      .toConstantValue(pluginRegistryRootDirectory)
      .whenTargetNamed('PLUGIN_REGISTRY_ROOT_DIRECTORY');
    this.container.bind('string').toConstantValue(outputDirectory).whenTargetNamed('OUTPUT_ROOT_DIRECTORY');

    await fs.mkdirs(unpackedDirectory);
    await fs.mkdirs(downloadDirectory);
    await fs.mkdirs(outputDirectory);

    return this.container;
  }
}
